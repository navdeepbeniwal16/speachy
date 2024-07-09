// Load environment variables
require("dotenv").config();

// Dependencies
const fs = require("fs");
const OpenAI = require("openai");
const express = require("express");
const router = express.Router();
const multer = require("multer");

// Constants
const TEMPORARY_AUDIO_FILENAME = "temp_audio_file.mp3";

// Initialise services
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_ACCESS_KEY,
  dangerouslyAllowBrowser: false,
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const getQuestionsSet = async (company, role, description) => {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are trained to generate behavioral interview questions based on specific job details.",
      },
      {
        role: "user",
        content: `Generate a list of behavioral interview questions for a job role at ${company}. The job title is ${role}. Here is the job description: ${description}`,
      },
      {
        role: "user",
        content:
          'Based on the information provided, what are some most probable behavioral interview questions? Please provide them in the following json format: { questions: [{"question": "question string", "tags": [string of associated tags]}] }',
      },
    ],
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
  });

  // Parse raw json response and extract questions

  // Throw error is response is not of array type or is empty
  if (!Array.isArray(completion.choices) || completion.choices.length < 0) {
    throw new Error(
      "Error occured in OpenAI chat api response while generating behavioural questions set."
    );
  }

  const questionsRawJSON = completion.choices[0].message.content;
  const questions = Object(JSON.parse(questionsRawJSON))["questions"];

  return questions;
};

router.get("/", (req, res, next) => {
  return res.json({ message: "Interviews api root is called..." });
});

router.post("/fetch-questions", async (req, res) => {
  const { company, role, description } = req.body;

  if (!company || !role) {
    return res
      .status(400)
      .send("'company' and 'role' are required in request body.");
  }

  console.log("interview.js : Received job details:", {
    company,
    role,
    description,
  }); // TODO: Include a logger instead of console statement

  try {
    const generatedQuestions = await getQuestionsSet(
      company,
      role,
      description
    );

    console.log("interview.js : Questions generated successfully!");

    res.status(200).json({
      message: "Questions generated successfully.",
      data: {
        questions: generatedQuestions,
      },
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
