// Load environment variables
require("dotenv").config();

// Dependencies
const winston = require("winston");
const OpenAI = require("openai");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { transcribeAudio } = require("../controllers/core");
const firebaseAdmin = require("../configs/firebase-admin.js");
const { getFirestore } = require("firebase-admin/firestore");

const IMPROMTU_QUESTIONS_IDS_COLLECTION = "impromptu_questions_ids";
const IMPROMPTU_QUESTIONS_IDS_DOC = "ids_document";
const IMPROMTU_QUESTIONS_COLLECTION = "impromptu_questions";

const LOG_LEVEL = process.env.LOG_LEVEL;
if (!LOG_LEVEL) {
  throw new Error("LOG_LEVEL not found in environment variables");
}

// Set up logging
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: "impromptu-speaking" },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Initialise services
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_ACCESS_KEY,
  dangerouslyAllowBrowser: false,
});
logger.info("'openai' service is initialised.");

const db = getFirestore(firebaseAdmin);
logger.info("firestore 'db' is initialised.");

// Function to fetch an array of all impromptu prompts ids
const getAllImpromptuPromptsIDs = async () => {
  logger.debug("Inside getAllImpromptuPromptsIDs()");
  const idsRef = db
    .collection(IMPROMTU_QUESTIONS_IDS_COLLECTION)
    .doc(IMPROMPTU_QUESTIONS_IDS_DOC);
  const idsDoc = await idsRef.get();

  // Check if the document exists
  if (!idsDoc.exists) {
    logger.error(
      `Document '${IMPROMPTU_QUESTIONS_IDS_DOC}' not found in '${IMPROMTU_QUESTIONS_IDS_COLLECTION}' collection.`
    );
    logger.debug("Return an empty impromptu prompts array");
    return []; // Return an empty array
  }

  const idsData = idsDoc.data();

  // Validate that 'ids' is an array and not empty
  if (!Array.isArray(idsData.ids) || idsData.ids.length === 0) {
    logger.error(
      `'ids' field is either missing or not an array in '${IMPROMPTU_QUESTIONS_IDS_DOC}' document.`
    );
    logger.debug("Return an empty impromptu prompts array");
    return []; // Return an empty array
  }

  logger.info("Impromptu Prompts IDs fetched.");
  logger.debug("Impromptu Prompts IDs:", { ids: idsData.ids });
  return idsData.ids;
};

// Function to get impromptu prompt object by 'id'
const getImpromptuPromptByID = async (id) => {
  logger.debug("Inside getImpromptuPromptByID()");
  const promptRef = db.collection(IMPROMTU_QUESTIONS_COLLECTION).doc(id);
  const promptDoc = await promptRef.get();

  // Check if the document exists
  if (!promptDoc.exists) {
    logger.error(
      `Document with id '${id}' not found in '${IMPROMTU_QUESTIONS_COLLECTION}' collection.`
    );
    logger.debug("Return a 'null' impromptu prompt object");
    return null; // Return null as document doesn't exist
  }

  const promptData = promptDoc.data();

  // Validate that the required fields are present and valid
  if (
    typeof promptData.question !== "string" ||
    promptData.question.trim() === "" ||
    typeof promptData.difficulty !== "string" ||
    promptData.difficulty.trim() === ""
  ) {
    logger.error(
      `Invalid or missing 'question' or 'difficulty' fields in document with id '${id}'.`
    );
    logger.debug("Return a 'null' impromptu prompt object");
    return null; // Return null as fields are missing or invalid
  }

  logger.info("Prompt object fetched successfully!");
  logger.debug("Prompt object to return:", { prompt: promptData });
  return promptData;
};

const fetchAudioTransacription = async (req, res, next) => {
  if (!req.file) {
    console.log("No file uploaded.");
    return res.status(400).send("No file uploaded.");
  }

  console.log(
    `Received audio file with ${req.file.size} bytes for transcription`
  );

  try {
    console.log(
      "Making transcription request to the core.js transcribeAudio function."
    );
    const resultTranscription = await transcribeAudio(req.file);

    if (!resultTranscription || !resultTranscription.text) {
      res.status(500).send("Failed to transcribe audio.");
    }

    const resultTranscriptionText = resultTranscription.text;
    console.log("Transcription request is successful");

    const transcription = {
      text: resultTranscriptionText,
    };
    req.transcription = transcription;
    next();
  } catch (error) {
    console.error("Error transcribing audio:", error);
    res.status(500).send({
      message: "Failed to transcribe audio.",
      errorDescription: error,
    });
  }
};

const evaluateResponse = async (req, res, next) => {
  const requestBody = req.body;
  try {
    if (!requestBody) {
      return res.status(400).json({
        message: "Error evaluating response",
        description: "Request body is missing",
      });
    }

    if (!requestBody.promptText) {
      return res.status(400).json({
        message: "Error evaluating response",
        description: "Request body is missing 'promptText'",
      });
    }

    if (!requestBody.responseText) {
      return res.status(400).json({
        message: "Error evaluating response",
        description: "Request body is missing 'responseText'",
      });
    }

    const { promptText, responseText } = requestBody;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a trained communication skills coach and your task is to evaluate responses to prompts. Your feedback should be critical, detailed, and effective while maintaining a friendly and supportive tone. Use relevant emojis and choice of wording to make the feedback approachable for school and university students.",
        },
        {
          role: "user",
          content: `Evaluate the following response to the prompt. \n Here's the prompt and response pair: \n Prompt: ${promptText} \n Response: ${responseText}`,
        },
        {
          role: "user",
          content:
            "Based on the information provided, CRITICALLY evaluate the response on the following aspects: \n" +
            "Relevance: How well the response addresses the prompt. Include specific examples of what was done well and areas for improvement.\n" +
            "Delivery: Clarity and fluency of the response. Provide detailed feedback on speaking pace, clarity, and use of pauses.\n" +
            "Tone: Appropriateness of tone given the prompt. Comment on the enthusiasm, pitch variation, and engagement level.\n" +
            "Please provide the results in the following JSON format:\n" +
            "{ summary (json) : {" +
            "relevance (json): { waysToImprove: [string array]: ['What was done well', 'What was lacking', 'Suggestions for improvement'], score: [float]: A score out of 10}," +
            "delivery (json): { waysToImprove: [string array]: ['What was done well', 'What was lacking', 'Suggestions for improvement'], score: [float]: A score out of 10}," +
            "tone (json): {waysToImprove: [string array]: ['What was done well', 'What was lacking', 'Suggestions for improvement'], score: [float]: A score out of 10}" +
            "}," +
            "detailedFeedback (string): overall feedback on the whole of the response to the prompt. It should include specific examples of areas to improve and suggestions for how the answer could be better. Ensure the detailed feedback is comprehensive and addresses multiple aspects of the response in depth. Use a friendly tone and incorporate relevant emojis to make it engaging. " +
            "fillers (integer): number of filler words," +
            "Clearly state what the user did well, what they lacked, and specific suggestions for improvement. For example, 'To improve relevance, you can...' or 'A good example of clarity in delivery is...' should be included within the text.\n" +
            "}",
        },
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    // Parse raw json response and extract evaluation results
    // Throw error is response is not of array type or is empty
    if (!Array.isArray(completion.choices) || completion.choices.length < 0) {
      throw new Error(
        "Error occured in OpenAI chat api response while generating evaluating response for the prompt."
      );
    }

    const evaluationResultsRawJSON = completion.choices[0].message.content;
    const evaluationResults = Object(JSON.parse(evaluationResultsRawJSON));

    req.results = evaluationResults;
    next();
  } catch (error) {
    console.log("Error evaluating prompt response:", error);
    return res.status(500).json({
      message: "Unknown error evaluating prompt response",
      description: error,
    });
  }
};

/* API Routes */
router.get("/prompt", async (req, res) => {
  logger.info("Inside /prompt API handler...");
  try {
    const allPromptsIdsArr = await getAllImpromptuPromptsIDs();
    const randomPromptIdIndex = Math.floor(
      Math.random() * allPromptsIdsArr.length
    );
    const randomPromptId = allPromptsIdsArr[randomPromptIdIndex];
    const prompt = await getImpromptuPromptByID(randomPromptId);

    res.status(200).json({
      message: "Prompt fetched successfully.",
      data: {
        prompt: prompt,
      },
    });
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/evaluate-response-text", evaluateResponse, (req, res, next) => {
  const results = req.results;
  res.json({
    message: "Prompt response successfully evaluated",
    results: results,
  });
});

router.post(
  "/evaluate-response-audio",
  upload.single("file"),
  fetchAudioTransacription,
  (req, res, next) => {
    const responseTranscription = req.transcription;
    req.body.responseText = responseTranscription.text;
    next();
  },
  evaluateResponse,
  (req, res, next) => {
    const feedback = req.results;
    const transcription = req.transcription;
    res.json({
      message: "Prompt response successfully evaluated",
      results: {
        feedback: feedback,
        transcription: transcription,
      },
    });
  }
);

module.exports = router;
