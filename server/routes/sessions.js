// Load environment variables
require("dotenv").config();

const express = require("express");
const router = express.Router();
const winston = require("winston");
const firebaseAdminApp = require("../configs/firebase-admin.js");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: "sessions" },
  transports: [new winston.transports.Console({ format: winston.format.simple() })],
});

const db = getFirestore(firebaseAdminApp);

const SESSIONS_COLLECTION = "user_sessions"; // doc id = uid, subcollection events
const STATS_COLLECTION = "user_stats"; // doc id = uid

const isValidTimeZone = (tz) => {
  if (!tz || typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
    return true;
  } catch (_) {
    return false;
  }
};

const formatDateInTZ = (date, tz) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const validSessionTypes = new Set(["interview", "impromptu"]);

// POST /sessions/record - minimal identity + timing
router.post("/record", async (req, res) => {
  try {
    const uid = req.user?.user_id;
    if (!uid) return res.status(401).json({ message: "Unauthorized" });
    const { sessionType, tz } = req.body || {};
    if (!validSessionTypes.has(sessionType)) {
      return res.status(400).json({ message: "Invalid or missing sessionType" });
    }

    const timeZone = isValidTimeZone(tz) ? tz : "UTC";
    const now = new Date();
    const streakDate = formatDateInTZ(now, timeZone);

    const eventsRef = db.collection(SESSIONS_COLLECTION).doc(uid).collection("events");
    const statsRef = db.collection(STATS_COLLECTION).doc(uid);

    const batch = db.batch();
    const eventRef = eventsRef.doc();
    batch.set(eventRef, {
      userId: uid,
      sessionType,
      source: "web",
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      streakDate,
      tz: timeZone,
      status: "completed",
    });

    batch.set(
      statsRef,
      {
        totalSessions: admin.firestore.FieldValue.increment(1),
        lastSessionAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await batch.commit();

    // Record streak day (best-effort); reuse existing endpoint
    try {
      await fetch(`${req.protocol}://${req.get("host")}/streak/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization,
        },
        body: JSON.stringify({ sessionType, tz: timeZone }),
      });
    } catch (err) {
      logger.warn("Failed to update streak after session record", { error: err.message });
    }

    logger.info("Session recorded", { uid, sessionType, streakDate });
    return res.status(201).json({ ok: true, streakDate });
  } catch (err) {
    logger.error("Error recording session", { error: err.message });
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /sessions/stats - minimal totals
router.get("/stats", async (req, res) => {
  try {
    const uid = req.user?.user_id;
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const snap = await db.collection(STATS_COLLECTION).doc(uid).get();
    const data = snap.exists ? snap.data() : {};
    return res.status(200).json({
      totalSessions: Number(data.totalSessions) || 0,
      lastSessionAt: data.lastSessionAt || null,
    });
  } catch (err) {
    logger.error("Error fetching session stats", { error: err.message });
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

