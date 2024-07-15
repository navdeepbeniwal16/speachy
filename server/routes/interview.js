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

// function to save buffer to a temporary file
const bufferToFile = async (buffer, filename) => {
  fs.writeFileSync(filename, buffer);
  return filename;
};

// function to transcribe an audio file using openai transcription api
const transcribeAudio = async (audioFile) => {
  try {
    console.log("Attempting transcription of audioFile.");
    const buffer = audioFile.buffer;
    const audioFilename = await bufferToFile(buffer, TEMPORARY_AUDIO_FILENAME);
    console.log(`Saved file temporarily as ${audioFilename}.`);
    const fileStream = fs.createReadStream(audioFilename);
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    console.log(
      "Transcription request is successful. Transcribed text:",
      transcription.text
    );

    fs.unlinkSync(audioFilename);
    console.log(`Temporary file ${audioFilename} in unlinked.`);

    return transcription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
  }
};

router.get("/", (req, res, next) => {
  return res.json({ message: "Interviews api root is called..." });
});

router.post("/fetch-questions", async (req, res) => {
  const { company, role, description } = req.body;

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

const generatePrompt = async () => {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are trained communications coaching who help people build their speaking skills.",
      },
      {
        role: "user",
        content: `Generate a random prompt that a user may find quite fun and comfortable to answer or talk about`,
      },
      {
        role: "user",
        content:
          "Please provide the prompt in the following json format: { prompt: prompt_string }",
      },
    ],
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
  });

  // Parse raw json response and extract questions
  // Throw error is response is not of array type or is empty
  if (!Array.isArray(completion.choices) || completion.choices.length < 0) {
    throw new Error(
      "Error occured in OpenAI chat api response while generating prompt."
    );
  }

  const rawJsonResponse = completion.choices[0].message.content;
  const prompt = Object(JSON.parse(rawJsonResponse))["prompt"];

  return prompt;
};

router.get("/imprompt", async (req, res) => {
  try {
    const prompt = await generatePrompt();

    console.log("interview.js : Prompt generated successfully!");

    res.status(200).json({
      message: "Prompt generated successfully.",
      data: {
        prompt: prompt,
      },
    });
  } catch (error) {
    console.error("Error generating prompt:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

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
      "Making transcription request to the transcribeAudio function."
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

router.post(
  "/transcribe-audio",
  upload.single("file"),
  fetchAudioTransacription,
  (req, res, next) => {
    const transcription = req.transcription;
    res.status(200).json({
      message: "Audio file transcribed successfully!",
      transcription: transcription,
    });
  }
);

const evaluateResponse = async (req, res, next) => {
  const requestBody = req.body;

  if (!requestBody) {
    return res.status(400).json({
      message: "Error evaluating response",
      description: "Request body is missing",
    });
  }

  const {
    questionText,
    responseText,
    companyName = null,
    jobRole = null,
    jobDescription = null,
  } = requestBody;

  if (!questionText) {
    return res.status(400).json({
      message: "Error evaluating response",
      description: "Request body is missing 'questionText'",
    });
  }

  if (!responseText) {
    return res.status(400).json({
      message: "Error evaluating response",
      description: "Request body is missing 'responseText'",
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are trained to evaluate behavioral interview questions based on specific job details. Your feedback should be critical, detailed, and effective while maintaining a constructive and supportive tone.",
        },
        {
          role: "user",
          content: `Evaluate the following response to the interview question for a job role at ${companyName}. The job title is ${jobRole}. \n Here's the job description (Could be null as well): ${jobDescription}. \n Here's the question and response pair: \n Question: ${questionText} \n Response: ${responseText}`,
        },
        {
          role: "user",
          content:
            "Based on the information provided, CRITICALLY evaluate the response on the following aspects: \n" +
            "Relevance: How well the response addresses the question. Include specific examples of what was done well and areas for improvement.\n" +
            "Delivery: Clarity and fluency of the response. Provide detailed feedback on speaking pace, clarity, and use of pauses.\n" +
            "Tone: Appropriateness of tone given the formal setting. Comment on professionalism, enthusiasm, and engagement level.\n" +
            "Please provide the results in the following JSON format:\n" +
            "{ summary: {" +
            "relevance: { waysToImprove: ['What was done well', 'What was lacking', 'Suggestions for improvement'], score: [float]: A score out of 10}," +
            "delivery: { waysToImprove: ['What was done well', 'What was lacking', 'Suggestions for improvement'], score: [float]: A score out of 10}," +
            "tone: {waysToImprove: ['What was done well', 'What was lacking', 'Suggestions for improvement'], score: [float]: A score out of 10}" +
            "}," +
            "detailedFeedback: overall feedback on the whole of the response taking into account the requirements of the role provided. It should include specific examples of areas to improve and suggestions for how the answer could be better. Ensure the detailed feedback is comprehensive and addresses multiple aspects of the response in depth. Use a constructive tone to encourage improvement.}" +
            "\n\nMake sure to be explicit in your feedback points under each category (relevance, delivery, tone). Clearly state what the user did well, what they lacked, and specific suggestions for improvement. For example, 'To improve relevance, you can...' or 'A good example of clarity in delivery is...'.",
        },
      ],
      response_format: { type: "json_object" },
    });

    if (!Array.isArray(completion.choices) || completion.choices.length === 0) {
      throw new Error(
        "Error occurred in OpenAI chat API response while generating evaluating response for the question and role details."
      );
    }

    const evaluationResultsRawJSON = completion.choices[0].message.content;
    const evaluationResults = JSON.parse(evaluationResultsRawJSON);

    req.results = evaluationResults;
    next();
  } catch (error) {
    console.log("Error evaluating response:", error);
    return res.status(500).json({
      message: "Unknown error evaluating response",
      description: error.message,
    });
  }
};

router.post("/evaluate-response-text", evaluateResponse, (req, res, next) => {
  const results = req.results;
  res.json({
    message: "Question response successfully evaluated",
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
      message: "Question response successfully evaluated",
      results: {
        feedback: feedback,
        transcription: transcription,
      },
    });
  }
);

module.exports = router;
