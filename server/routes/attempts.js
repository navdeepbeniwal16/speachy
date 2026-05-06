require("dotenv").config();

const express = require("express");
const router = express.Router();
const winston = require("winston");
const firebaseAdmin = require("../configs/firebase-admin.js");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: "attempts" },
  transports: [new winston.transports.Console({ format: winston.format.simple() })],
});

const db = getFirestore(firebaseAdmin);

const attemptsRef  = (uid) => db.collection("users").doc(uid).collection("attempts");
const summariesRef = (uid) => db.collection("users").doc(uid).collection("question_summaries");

// POST /attempts — save one completed attempt + upsert question summary
router.post("/", async (req, res) => {
  const uid = req.user.user_id;
  const {
    questionKey,
    questionText,
    sourceName,
    sourceKind,
    projectId,
    collectionId,
    scores,
    avgScore,
    overview,
    tip,
    dimensions,
    speechStats,
    transcript,
    inputMode,
  } = req.body;

  if (!questionKey || !questionText || !scores) {
    return res.status(400).json({ success: false, error: "questionKey, questionText, and scores are required" });
  }

  const attemptedAt = new Date().toISOString();

  const attemptData = {
    questionKey,
    questionText,
    sourceName:   sourceName   ?? null,
    sourceKind:   sourceKind   ?? "session",
    projectId:    projectId    ?? null,
    collectionId: collectionId ?? null,
    scores: {
      relevance:    scores.relevance    ?? 0,
      structure:    scores.structure    ?? 0,
      authenticity: scores.authenticity ?? 0,
    },
    avgScore:  avgScore  ?? 0,
    overview:  overview  ?? "",
    tip:       tip       ?? null,
    dimensions: {
      relevance:    { waysToImprove: dimensions?.relevance?.waysToImprove    ?? [] },
      structure:    { waysToImprove: dimensions?.structure?.waysToImprove    ?? [] },
      authenticity: { waysToImprove: dimensions?.authenticity?.waysToImprove ?? [] },
    },
    speechStats: {
      duration:    speechStats?.duration    ?? null,
      wpm:         speechStats?.wpm         ?? null,
      fillerCount: speechStats?.fillerCount ?? null,
    },
    transcript: transcript ?? null,
    inputMode:  inputMode  ?? "text",
    attemptedAt,
  };

  const summaryData = {
    questionKey,
    questionText,
    sourceName:   sourceName   ?? null,
    sourceKind:   sourceKind   ?? "session",
    projectId:    projectId    ?? null,
    collectionId: collectionId ?? null,
    latestScores: {
      relevance:    scores.relevance    ?? 0,
      structure:    scores.structure    ?? 0,
      authenticity: scores.authenticity ?? 0,
      avg:          avgScore ?? 0,
    },
    latestAttemptedAt: attemptedAt,
    attemptCount: FieldValue.increment(1),
  };

  try {
    const batch = db.batch();
    const attemptDoc = attemptsRef(uid).doc();
    batch.set(attemptDoc, attemptData);
    batch.set(summariesRef(uid).doc(questionKey), summaryData, { merge: true });
    await batch.commit();

    logger.info("Attempt saved", { uid, questionKey, attemptId: attemptDoc.id });
    res.status(201).json({ success: true, attemptId: attemptDoc.id });
  } catch (error) {
    logger.error("Error saving attempt", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to save attempt" });
  }
});

// GET /attempts?questionKey= — all attempts for one question, newest first
router.get("/", async (req, res) => {
  const uid = req.user.user_id;
  const { questionKey } = req.query;

  if (!questionKey) {
    return res.status(400).json({ success: false, error: "questionKey query param is required" });
  }

  try {
    const snapshot = await attemptsRef(uid).where("questionKey", "==", questionKey).get();
    const attempts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    attempts.sort((a, b) => b.attemptedAt.localeCompare(a.attemptedAt));
    logger.info("Fetched attempts for question", { uid, questionKey, count: attempts.length });
    res.status(200).json({ attempts });
  } catch (error) {
    logger.error("Error fetching attempts", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to fetch attempts" });
  }
});

// GET /attempts/summaries — one summary per unique question, newest first
router.get("/summaries", async (req, res) => {
  const uid = req.user.user_id;
  try {
    const snapshot = await summariesRef(uid).get();
    const summaries = snapshot.docs.map((doc) => ({ ...doc.data() }));
    summaries.sort((a, b) => b.latestAttemptedAt.localeCompare(a.latestAttemptedAt));
    logger.info("Fetched question summaries", { uid, count: summaries.length });
    res.status(200).json({ summaries });
  } catch (error) {
    logger.error("Error fetching summaries", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to fetch summaries" });
  }
});

module.exports = router;
