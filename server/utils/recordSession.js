const admin = require("firebase-admin");
const firebaseAdminApp = require("../configs/firebase-admin.js");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore(firebaseAdminApp);

const SESSIONS_COLLECTION = "user_sessions";
const STATS_COLLECTION    = "user_stats";
const STREAK_COLLECTION   = "user_streak";
const ACTIVITY_COLLECTION = "user_activity";

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
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const ymdSubtractDays = (ymd, days) => {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - days);
  return [
    dt.getUTCFullYear(),
    String(dt.getUTCMonth() + 1).padStart(2, "0"),
    String(dt.getUTCDate()).padStart(2, "0"),
  ].join("-");
};

/**
 * Write streak + activity data directly via Admin SDK.
 * Extracted from streak.js POST /record — identical logic, no HTTP.
 */
async function recordStreakDay(uid, sessionType, timeZone) {
  const now        = new Date();
  const todayStr   = formatDateInTZ(now, timeZone);
  const yesterdayStr = ymdSubtractDays(todayStr, 1);

  const userActivityRef = db.collection(ACTIVITY_COLLECTION).doc(uid);
  const dayRef          = userActivityRef.collection("days").doc(todayStr);
  const streakRef       = db.collection(STREAK_COLLECTION).doc(uid);

  return db.runTransaction(async (tx) => {
    const [daySnap, streakSnap] = await Promise.all([tx.get(dayRef), tx.get(streakRef)]);

    let current = 0, best = 0, lastActiveDate = null;
    if (streakSnap.exists) {
      const data = streakSnap.data();
      current        = Number(data.current) || 0;
      best           = Number(data.best)    || 0;
      lastActiveDate = data.lastActiveDate  || null;
    }

    if (daySnap.exists) {
      tx.set(dayRef, { sources: admin.firestore.FieldValue.arrayUnion(sessionType), tz: timeZone }, { merge: true });
      if (lastActiveDate !== todayStr) {
        tx.set(streakRef, { lastActiveDate: todayStr, tz: timeZone, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } else {
      tx.set(dayRef, { date: todayStr, sources: [sessionType], tz: timeZone, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      if (lastActiveDate === yesterdayStr) {
        current = current + 1;
      } else if (lastActiveDate !== todayStr) {
        current = 1;
      }
      if (current > best) best = current;
      tx.set(streakRef, { current, best, lastActiveDate: todayStr, tz: timeZone, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }
  });
}

/**
 * Record a completed session (events + stats) and update the streak.
 * Replaces the chain of two internal fetch() calls in interview.js and sessions.js.
 */
async function recordSessionAndStreak(uid, sessionType, tz) {
  const timeZone  = isValidTimeZone(tz) ? tz : "UTC";
  const now       = new Date();
  const streakDate = formatDateInTZ(now, timeZone);

  const eventsRef = db.collection(SESSIONS_COLLECTION).doc(uid).collection("events");
  const statsRef  = db.collection(STATS_COLLECTION).doc(uid);

  const batch = db.batch();
  batch.set(eventsRef.doc(), {
    userId: uid,
    sessionType,
    source: "web",
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
    streakDate,
    tz: timeZone,
    status: "completed",
  });
  batch.set(statsRef, {
    totalSessions: admin.firestore.FieldValue.increment(1),
    lastSessionAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  await batch.commit();

  await recordStreakDay(uid, sessionType, timeZone);

  return { streakDate };
}

module.exports = { recordSessionAndStreak, recordStreakDay };
