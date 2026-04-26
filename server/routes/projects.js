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
  defaultMeta: { service: "projects" },
  transports: [new winston.transports.Console({ format: winston.format.simple() })],
});

const db = getFirestore(firebaseAdmin);

// Firestore helper — projects live under users/{uid}/projects
const projectsRef = (uid) =>
  db.collection("users").doc(uid).collection("projects");

// GET /projects — list all projects for the authenticated user
router.get("/", async (req, res) => {
  const uid = req.user.user_id;
  try {
    const snapshot = await projectsRef(uid).orderBy("createdAt", "desc").get();
    const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    logger.info("Fetched projects", { uid, count: projects.length });
    res.status(200).json({ projects });
  } catch (error) {
    logger.error("Error fetching projects", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to fetch projects" });
  }
});

// POST /projects — create a new project
router.post("/", async (req, res) => {
  const uid = req.user.user_id;
  const {
    name,
    questions,
    type,
    kind,
    companyName,
    jobRole,
    industry,
    requiredExperience,
    jobDescription,
    additionalNotes,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: "Project name is required" });
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ success: false, error: "Questions array is required" });
  }

  try {
    const projectRef = await projectsRef(uid).add({
      name: name.trim(),
      questions,
      type: type || "interview",
      kind: kind || null,
      companyName: companyName || null,
      jobRole: jobRole || null,
      industry: industry || null,
      requiredExperience: requiredExperience || null,
      jobDescription: jobDescription || null,
      additionalNotes: additionalNotes || null,
      createdAt: new Date().toISOString(),
    });

    logger.info("Project saved", { uid, projectId: projectRef.id, type: type || "interview" });
    res.status(201).json({ success: true, projectId: projectRef.id });
  } catch (error) {
    logger.error("Error saving project", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to save project" });
  }
});

// GET /projects/:id — fetch a single project by ID
router.get("/:id", async (req, res) => {
  const uid = req.user.user_id;
  const { id } = req.params;
  try {
    const docSnap = await projectsRef(uid).doc(id).get();

    if (!docSnap.exists) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    const project = { id: docSnap.id, ...docSnap.data() };
    logger.info("Fetched project by id", { uid, projectId: id });
    res.status(200).json({ project });
  } catch (error) {
    logger.error("Error fetching project by id", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to fetch project" });
  }
});

module.exports = router;
