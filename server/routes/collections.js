require("dotenv").config();

const express = require("express");
const router = express.Router();
const winston = require("winston");
const firebaseAdmin = require("../configs/firebase-admin.js");
const { getFirestore } = require("firebase-admin/firestore");

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: "collections" },
  transports: [new winston.transports.Console({ format: winston.format.simple() })],
});

const db = getFirestore(firebaseAdmin);
const collectionsRef = () => db.collection("curated_collections");

// GET /collections — list all published curated collections
router.get("/", async (req, res) => {
  try {
    const snapshot = await collectionsRef()
      .where("isPublished", "==", true)
      .get();

    const collections = snapshot.docs
      .map((doc) => {
        const { name, description, author, tags, questionCount, lastUpdated, createdAt } = doc.data();
        return { id: doc.id, name, description, author, tags, questionCount, lastUpdated, createdAt };
      })
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
      .map(({ createdAt: _omit, ...rest }) => rest);

    logger.info("Fetched curated collections", { count: collections.length });
    res.status(200).json({ collections });
  } catch (error) {
    logger.error("Error fetching curated collections", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to fetch collections" });
  }
});

// GET /collections/:id/questions — fetch a single collection with its questions
router.get("/:id/questions", async (req, res) => {
  const { id } = req.params;
  try {
    const colDoc = await collectionsRef().doc(id).get();
    if (!colDoc.exists) {
      return res.status(404).json({ success: false, error: "Collection not found" });
    }

    const questionsSnap = await collectionsRef().doc(id).collection("questions").get();
    const questions = questionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const { name, description, author, tags, questionCount, lastUpdated } = colDoc.data();
    const collection = { id: colDoc.id, name, description, author, tags, questionCount, lastUpdated };

    logger.info("Fetched collection questions", { collectionId: id, count: questions.length });
    res.status(200).json({ collection, questions });
  } catch (error) {
    logger.error("Error fetching collection questions", { collectionId: id, error: error.message });
    res.status(500).json({ success: false, error: "Failed to fetch collection questions" });
  }
});

module.exports = router;
