// Load environment variables
require("dotenv").config();

const express = require("express");
const router = express.Router();
const winston = require("winston");
const firebaseAdminApp = require("../configs/firebase-admin.js");
const admin = require("firebase-admin");
const { getFirestore, FieldPath } = require("firebase-admin/firestore");

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: "streak" },
  transports: [new winston.transports.Console({ format: winston.format.simple() })],
});

const db = getFirestore(firebaseAdminApp);

const STREAK_COLLECTION = "user_streak"; // doc id = uid
const ACTIVITY_COLLECTION = "user_activity"; // doc id = uid, subcollection "days" with doc id = YYYY-MM-DD

// Utility: validate IANA time zone
const isValidTimeZone = (tz) => {
  if (!tz || typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
    return true;
  } catch (e) {
    return false;
  }
};

// Utility: format a Date into YYYY-MM-DD in a given IANA time zone
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

// Utility: subtract N days from a YYYY-MM-DD string (calendar arithmetic)
const ymdSubtractDays = (ymd, days) => {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - days);
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const validSessionTypes = new Set(["interview", "impromptu"]);

// POST /streak/record
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
    const todayStr = formatDateInTZ(now, timeZone);
    const yesterdayStr = ymdSubtractDays(todayStr, 1);

    const userActivityRef = db.collection(ACTIVITY_COLLECTION).doc(uid);
    const dayRef = userActivityRef.collection("days").doc(todayStr);
    const streakRef = db.collection(STREAK_COLLECTION).doc(uid);

    const result = await db.runTransaction(async (tx) => {
      const [daySnap, streakSnap] = await Promise.all([
        tx.get(dayRef),
        tx.get(streakRef),
      ]);

      let current = 0;
      let best = 0;
      let lastActiveDate = null;
      let todayDone = false;

      if (!streakSnap.exists) {
        current = 0;
        best = 0;
        lastActiveDate = null;
      } else {
        const data = streakSnap.data();
        current = Number(data.current) || 0;
        best = Number(data.best) || 0;
        lastActiveDate = data.lastActiveDate || null;
      }

      if (daySnap.exists) {
        // Idempotent: day already recorded — union sources and do not change current
        tx.set(
          dayRef,
          { sources: admin.firestore.FieldValue.arrayUnion(sessionType), tz: timeZone },
          { merge: true }
        );
        todayDone = true;
        // Keep streak unchanged; optionally sync lastActiveDate to today if older
        if (lastActiveDate !== todayStr) {
          tx.set(
            streakRef,
            { lastActiveDate: todayStr, tz: timeZone, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
            { merge: true }
          );
          lastActiveDate = todayStr;
        }
      } else {
        // First record for this calendar day — create day and update streak
        tx.set(dayRef, {
          date: todayStr,
          sources: [sessionType],
          tz: timeZone,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        todayDone = true;

        if (lastActiveDate === todayStr) {
          // Rare case: streak doc says today already; don't change counts
        } else if (lastActiveDate === yesterdayStr) {
          current = current + 1;
        } else {
          current = 1;
        }
        if (current > best) best = current;

        tx.set(
          streakRef,
          {
            current,
            best,
            lastActiveDate: todayStr,
            tz: timeZone,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      return { current, best, lastActiveDate: todayStr, todayDone };
    });

    logger.info("Recorded streak day", { uid, today: result.lastActiveDate, sessionType });
    return res.status(200).json(result);
  } catch (err) {
    logger.error("Error recording streak", { error: err.message });
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /streak/summary
router.get("/summary", async (req, res) => {
  try {
    const uid = req.user?.user_id;
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    // Determine tz and today for todayDone check
    const streakSnap = await db.collection(STREAK_COLLECTION).doc(uid).get();
    const tz = (streakSnap.exists && streakSnap.data().tz) || "UTC";
    const todayStr = formatDateInTZ(new Date(), tz);
    const daySnap = await db
      .collection(ACTIVITY_COLLECTION)
      .doc(uid)
      .collection("days")
      .doc(todayStr)
      .get();

    const todayDone = daySnap.exists;
    const data = streakSnap.exists
      ? streakSnap.data()
      : { current: 0, best: 0, lastActiveDate: null, tz };

    return res.status(200).json({
      current: Number(data.current) || 0,
      best: Number(data.best) || 0,
      lastActiveDate: data.lastActiveDate || null,
      tz,
      todayDone,
    });
  } catch (err) {
    logger.error("Error fetching streak summary", { error: err.message });
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /streak/activity?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/activity", async (req, res) => {
  try {
    const uid = req.user?.user_id;
    if (!uid) return res.status(401).json({ message: "Unauthorized" });
    const { from, to } = req.query;
    if (!from || !to || typeof from !== "string" || typeof to !== "string") {
      return res.status(400).json({ message: "Missing or invalid 'from'/'to'" });
    }

    const daysRef = db.collection(ACTIVITY_COLLECTION).doc(uid).collection("days");
    const q = daysRef
      .where(FieldPath.documentId(), ">=", from)
      .where(FieldPath.documentId(), "<=", to)
      .orderBy(FieldPath.documentId());

    const snap = await q.get();
    const dates = [];
    const sourcesByDate = {};
    snap.forEach((doc) => {
      dates.push(doc.id);
      const data = doc.data();
      sourcesByDate[doc.id] = Array.isArray(data.sources) ? data.sources : [];
    });

    return res.status(200).json({ dates, sourcesByDate });
  } catch (err) {
    logger.error("Error fetching activity range", { error: err.message });
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

