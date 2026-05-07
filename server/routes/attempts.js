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

    // Lazy backfill: for summaries with null sourceName but a known projectId,
    // derive the correct name from the project document and persist it.
    const needsBackfill = summaries.filter((s) => !s.sourceName && s.projectId);
    if (needsBackfill.length > 0) {
      const projectIds = [...new Set(needsBackfill.map((s) => s.projectId))];
      const projectDocs = await Promise.all(
        projectIds.map((id) =>
          db.collection("users").doc(uid).collection("projects").doc(id).get()
        )
      );
      const projectMap = {};
      for (const doc of projectDocs) {
        if (doc.exists) projectMap[doc.id] = doc.data();
      }

      const batch = db.batch();
      for (const summary of needsBackfill) {
        const project = projectMap[summary.projectId];
        if (!project) continue;
        let derivedName;
        if (project.kind === "custom") {
          derivedName = project.name || null;
        } else {
          const parts = [project.companyName, project.jobRole].filter(Boolean);
          derivedName = parts.length > 0 ? parts.join(" · ") : null;
        }
        if (derivedName) {
          summary.sourceName = derivedName; // fix in-memory for this response
          batch.update(summariesRef(uid).doc(summary.questionKey), { sourceName: derivedName });
        }
      }
      await batch.commit();
      logger.info("Backfilled sourceName for summaries", { uid, count: needsBackfill.length });
    }

    summaries.sort((a, b) => b.latestAttemptedAt.localeCompare(a.latestAttemptedAt));
    logger.info("Fetched question summaries", { uid, count: summaries.length });
    res.status(200).json({ summaries });
  } catch (error) {
    logger.error("Error fetching summaries", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to fetch summaries" });
  }
});

// GET /attempts/project-summary/:projectId — aggregated scores + trends for a project
router.get("/project-summary/:projectId", async (req, res) => {
  const uid = req.user.user_id;
  const { projectId } = req.params;
  const { collectionId } = req.query; // optional: also sweep old attempts saved before projectId was tracked
  try {
    // Primary query: attempts saved with the correct projectId
    const snap1 = await attemptsRef(uid).where("projectId", "==", projectId).get();
    const byProject = snap1.docs.map((d) => ({ _id: d.id, ...d.data() }));

    // Fallback query: attempts saved before projectId was tracked (stored with collectionId only)
    let byCollection = [];
    if (collectionId) {
      const snap2 = await attemptsRef(uid)
        .where("collectionId", "==", collectionId)
        .where("projectId", "==", null)
        .get();
      byCollection = snap2.docs.map((d) => ({ _id: d.id, ...d.data() }));
    }

    // Merge and deduplicate by document ID
    const seen = new Set();
    const attempts = [];
    for (const a of [...byProject, ...byCollection]) {
      if (!seen.has(a._id)) { seen.add(a._id); attempts.push(a); }
    }

    if (attempts.length === 0) {
      return res.status(200).json({ avgScores: null, trends: null, attemptedQuestionCount: 0 });
    }

    attempts.sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt));

    const dims = ["relevance", "structure", "authenticity"];
    const avgScores = {};
    const trends = {};

    // Group attempts by question (preserving chronological order within each group)
    const byQuestion = {};
    for (const a of attempts) {
      const key = a.questionKey || "_unknown";
      if (!byQuestion[key]) byQuestion[key] = [];
      byQuestion[key].push(a);
    }

    for (const dim of dims) {
      // Average across all attempts for this dimension
      const allValues = attempts.map((a) => a.scores?.[dim] ?? 0);
      avgScores[dim] = Math.round((allValues.reduce((s, v) => s + v, 0) / allValues.length) * 10) / 10;

      // Per-question trend vote
      const votes = { improving: 0, stable: 0, declining: 0 };
      let votingQuestions = 0;

      for (const qAttempts of Object.values(byQuestion)) {
        if (qAttempts.length < 2) continue; // need ≥ 2 attempts on a question to compute direction
        votingQuestions++;
        const scores = qAttempts.map((a) => a.scores?.[dim] ?? 0);
        const diff = scores[scores.length - 1] - scores[scores.length - 2];
        if (diff > 0.1)       votes.improving++;
        else if (diff < -0.1) votes.declining++;
        else                  votes.stable++;
      }

      if (votingQuestions === 0) {
        trends[dim] = null; // not enough data on any question
      } else if (votes.improving > votes.declining && votes.improving > votes.stable) {
        trends[dim] = "improving";
      } else if (votes.declining > votes.improving && votes.declining > votes.stable) {
        trends[dim] = "declining";
      } else {
        trends[dim] = "stable"; // ties default to stable
      }
    }

    const attemptedQuestionCount = new Set(
      attempts.map((a) => a.questionKey).filter(Boolean)
    ).size;

    logger.info("Fetched project summary", { uid, projectId, attemptedQuestionCount });
    res.status(200).json({ avgScores, trends, attemptedQuestionCount });
  } catch (error) {
    logger.error("Error fetching project summary", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to fetch project summary" });
  }
});

module.exports = router;
