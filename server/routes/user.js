const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Mock database
const savedQuestions = {};

// API to Save a New Question
router.post("/saved-interview-questions", (req, res) => {
  const userId = req.user.user_id;
  console.log("Saving question for userId", userId);
  const { questionText, responseText, stats } = req.body;

  // Validate request body
  if (!questionText) {
    return res.status(400).json({
      status: "error",
      message: "Saved interview questions entry requires a 'questionText'",
    });
  }

  if (stats && Array.isArray(stats)) {
    // Validate the stats structure
    const requiredStats = [
      "relevance",
      "structure",
      "sentiment",
      "authenticity",
    ];
    for (const stat of stats) {
      const missingFields = requiredStats.filter((field) => !(field in stat));
      if (missingFields.length > 0) {
        return res.status(400).json({
          status: "error",
          message: `Missing required stat fields: ${missingFields.join(", ")}`,
        });
      }
    }
  }

  const savedQuestion = {
    savedQuestionId: uuidv4(),
    questionText,
    responseText: responseText || null,
    stats: stats || [],
    savedAt: new Date().toISOString(),
  };

  // Ensure the userId key exists in savedQuestions
  if (!savedQuestions[userId]) {
    savedQuestions[userId] = []; // Initialize an empty array for this user
  }

  // Push the saved question to the user's array
  savedQuestions[userId].push(savedQuestion);

  // Construct response
  const response = {
    status: "success",
    message: "Question saved successfully",
    savedQuestion: savedQuestion,
    userId: userId,
  };

  res.status(201).json(response);
});

// Get All Saved Questions
// Get All Saved Questions
router.get("/saved-interview-questions", (req, res) => {
  const userId = req.user.user_id;

  const userSavedQuestions = savedQuestions[userId] || [];

  // Construct response
  const response = {
    status: "success",
    message: "Retrieved saved questions successfully",
    userId: userId,
    totalQuestions: userSavedQuestions.length,
    savedQuestions: userSavedQuestions,
  };

  res.status(200).json(response);
});

// 3. Get a Specific Saved Question
router.get(
  "/user/:userId/saved-interview-questions/:savedQuestionId",
  (req, res) => {
    const { userId, savedQuestionId } = req.params;

    const question = savedQuestions.find(
      (q) => q.userId === userId && q.savedQuestionId === savedQuestionId
    );

    if (!question) {
      return res.status(404).json({ message: "Saved question not found" });
    }

    res.json(question);
  }
);

// Update a Saved Question
router.put("/saved-interview-questions/:savedQuestionId", (req, res) => {
  const userId = req.user.user_id; // Extract the user ID from the request
  const { savedQuestionId } = req.params; // Extract the savedQuestionId from the route
  const { responseText, stats } = req.body; // Extract the fields to update

  // Find the user's saved questions
  const userSavedQuestions = savedQuestions[userId];
  if (!userSavedQuestions) {
    return res.status(404).json({
      status: "error",
      message: "No saved questions found for this user",
    });
  }

  // Find the specific question by savedQuestionId
  const savedQuestion = userSavedQuestions.find(
    (question) => question.savedQuestionId === savedQuestionId
  );

  if (!savedQuestion) {
    return res.status(404).json({
      status: "error",
      message: "Saved question not found",
    });
  }

  // Validate stats if provided
  if (stats && Array.isArray(stats)) {
    const requiredStats = [
      "relevance",
      "structure",
      "sentiment",
      "authenticity",
    ];
    for (const stat of stats) {
      const missingFields = requiredStats.filter((field) => !(field in stat));
      if (missingFields.length > 0) {
        return res.status(400).json({
          status: "error",
          message: `Missing required stat fields: ${missingFields.join(", ")}`,
        });
      }
    }
  }

  // Update the fields if they are provided
  if (responseText) savedQuestion.responseText = responseText;
  if (stats) savedQuestion.stats = stats;

  // Send the updated question as a response
  res.status(200).json({
    status: "success",
    message: "Saved question updated successfully",
    savedQuestion: savedQuestion,
    userId: userId,
  });
});

// Delete a Saved Question
router.delete("/saved-interview-questions/:savedQuestionId", (req, res) => {
  const userId = req.user.user_id; // Extract the user ID from the request
  const { savedQuestionId } = req.params; // Extract the savedQuestionId from the route

  // Find the user's saved questions
  const userSavedQuestions = savedQuestions[userId];
  if (!userSavedQuestions) {
    return res.status(404).json({
      status: "error",
      message: "No saved questions found for this user",
    });
  }

  // Find the index of the specific question by savedQuestionId
  const questionIndex = userSavedQuestions.findIndex(
    (question) => question.savedQuestionId === savedQuestionId
  );

  if (questionIndex === -1) {
    return res.status(404).json({
      status: "error",
      message: "Saved question not found",
    });
  }

  // Remove the question from the user's array
  const [deletedQuestion] = userSavedQuestions.splice(questionIndex, 1);

  // Return success response
  res.status(200).json({
    status: "success",
    message: "Saved question deleted successfully",
    deletedQuestion: deletedQuestion,
  });
});

module.exports = router;
