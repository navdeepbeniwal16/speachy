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

const getQuestionsSet = async (
  company,
  role,
  description,
  industry,
  requiredExperience
) => {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are trained to generate behavioral interview questions based on specific job details.",
      },
      {
        role: "user",
        content: `Generate a list of behavioral interview questions for a job role at company: ${company}, which operates in the industry: ${industry}. The job title is ${role} and requires someone with a ${requiredExperience} experience level. Here is the job description: ${description}`,
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
  const { company, role, description, industry, requiredExperience } = req.body;

  console.log("interview.js : Received job details:", {
    company,
    role,
    description,
    industry,
    requiredExperience,
  }); // TODO: Include a logger instead of console statement

  try {
    const generatedQuestions = await getQuestionsSet(
      company,
      role,
      description,
      industry,
      requiredExperience
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
    industry = null,
    requiredExperience,
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

  const model = "gpt-4o-mini";
  const systemPrompt = {
    role: "system",
    content:
      "You are a trained job interviewing coach and you are tasked with evaluating behavioral interview questions response based on the specific job details. Your feedback should be critical, should include expert-level details, and should be effective. Your response should have a 'Humane' tone, and shouldn't be 'Condescending', 'Mean' or 'Too nice'",
  };

  const userPrompt = {
    role: "user",
    content: `Evaluate the following response to the interview question for a job role at company: ${companyName}, which operates in the ${industry} industry. The job title is ${jobRole}, and requires someone with an ${requiredExperience} level experience. \n Here's the job description: """${jobDescription}""". \n Here's the question and response pair: \n Question: ${questionText} \n Response: ${responseText} \n Note: The Company, Job Role and Description could be empty/null as well`,
  };

  console.log("Evaluation UserPrompt:", userPrompt); // TODO: TBR - Only for debugging

  const getInstructionPrompt = (instruction) => {
    const instructionPrompt = {
      role: "user",
      content: instruction,
    };

    return instructionPrompt;
  };

  const parseFieldValue = async (completion, field) => {
    // Ensure we receive a response from the Chat API
    if (!Array.isArray(completion.choices) || completion.choices.length === 0) {
      throw new Error(
        "Error occurred in OpenAI Chat API response while generating Response overview"
      );
    }

    // Extracting the JSON response to a java object
    const responseRawJSON = completion.choices[0].message.content;
    const responseJSON = JSON.parse(responseRawJSON);

    if (!responseJSON[field]) {
      throw new Error(
        `${field} field not present in the OpenAI Chat API response`
      );
    }

    return responseJSON[field];
  };

  const getFeedback = async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        systemPrompt,
        userPrompt,
        {
          role: "user",
          content:
            "Based on the information provided, CRITICALLY evaluate the response on the following aspects: \n" +
            "Relevance: How well the response addresses the question. Include specific examples of what was done well and areas for improvement.\n" +
            "Delivery: Clarity and fluency of the response. Provide detailed feedback on speaking pace, clarity, and use of pauses.\n" +
            "Tone: Appropriateness of tone given the formal setting. Comment on professionalism, enthusiasm, and engagement level.\n" +
            "Please provide the results in the following JSON format:\n" +
            "{ summary (json): {" +
            "relevance (json): { waysToImprove: ['What was done well', 'What was lacking', 'Suggestions for improvement'], score: [float]: A score out of 10}," +
            "delivery (json): { waysToImprove: ['What was done well', 'What was lacking', 'Suggestions for improvement'], score: [float]: A score out of 10}," +
            "tone (json): {waysToImprove: ['What was done well', 'What was lacking', 'Suggestions for improvement'], score: [float]: A score out of 10}" +
            "}," +
            "detailedFeedback (string): overall feedback on the whole of the response taking into account the requirements of the role provided. It should include specific examples of areas to improve and suggestions for how the answer could be better. Ensure the detailed feedback is comprehensive and addresses multiple aspects of the response in depth. Use a constructive tone to encourage improvement." +
            "Clearly state what the user did well, what they lacked, and specific suggestions for improvement. For example, 'To improve relevance, you can...' or 'A good example of clarity in delivery is...' should be included in the paragraph.\n" +
            "overview (string) : Praise words, very breifly describe positive thing about the response and example eg: Well done, you gave an engaging response by mentioning your pet Toby!," +
            "tip (string) : Next time try [insert advice] to improve your response" +
            "fillers (integer): number of filler words," +
            "}",
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
    return evaluationResults;
  };

  const getOverview = async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        systemPrompt,
        userPrompt,
        getInstructionPrompt(
          "Your response needs to provide an 'overview' of the response to the question, briefly describing the positives and areas to improve \n" +
            "Notes: The overview field text should be in not more than 30 words\n" +
            "You must provide the results in the following JSON format:\n" +
            "{" +
            "overview (string) : Praise words, very breifly describe positive thing about the response and example. Eg: Well done, your response effectively highlights your strong problem-solving skills and a clear debugging approach, but includes more technical details than a recruiter or hiring manager may easily grasp." +
            "}"
        ),
      ],
      response_format: { type: "json_object" },
    });

    // Parse 'overview' string value from the response
    return parseFieldValue(completion, "overview");
  };

  const getTip = async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        systemPrompt,
        userPrompt,
        getInstructionPrompt(
          "Your response needs to provide a key (i.e the most relevant) 'tip' to the user to improve the response/delivery/engagement\n" +
            "Notes: The 'tip' field text should be in not more than 20 words\n" +
            "You must provide the results in the following JSON format:\n" +
            "{" +
            "tip (string) : Next time try [insert advice] to improve your response. Eg: Next time, try to improve your response by avoiding too many technical jargons and focusing on the project outcomes" +
            "}"
        ),
      ],
      response_format: { type: "json_object" },
    });

    // Parse 'tip' string value from the response
    return parseFieldValue(completion, "tip");
  };

  const getRelevance = async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        systemPrompt,
        userPrompt,
        getInstructionPrompt(
          "Your response needs to provide an expert-level critical evaluation of the response for it's relevance\n" +
            "Approach to follow:\n" +
            "Step 1: Extract a maximum of three highlights around what's currently making the response less relevant to the question being asked. Notes: 1. Judge the response from the eyes of a Hiring Manager 2. Don't include problems that are quite minor 3. There should be no more than 3 bullet points\n" +
            "Step 2: Based on the highlights extracted in Step 1, suggest a 'ways to improve' each of the problem in a very brief bullet point. NOTE: 1. There should be no more than bullet points than the highlights generated in Step 1 2. The tone of the text should be warm, humane, and humorous occsionally 3. Each bullet point should have no more than 25 words\n" +
            "Notes: The 'waysToImprove' field array should not contain more than 3 bullet points\n" +
            "You must provide the results in the following JSON format:\n" +
            "{" +
            "relevance (json): { waysToImprove: [examples: 'Mention how you communicated the issue to stakeholders, showing you’re not just a tech wizard but a people person too!', 'Wrap it up with a takeaway or lesson learned to show you’re continuously growing—hiring managers love a learner’s mindset!'], score: [float]: A score out of 10}," +
            "}"
        ),
      ],
      response_format: { type: "json_object" },
    });

    // Parse 'tip' string value from the response
    return parseFieldValue(completion, "relevance");
  };

  const getDelivery = async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        systemPrompt,
        userPrompt,
        getInstructionPrompt(
          "Your response needs to provide an expert-level critical evaluation of the delivery of the answer to the question\n" +
            "Approach to follow:\n" +
            "Step 1: Find a maximum of three highlights (Only if possible, and not nitpicking) around what's currently making the response delivery less impactful. Notes: 1. Judge the response from the eyes of a Hiring Manager 2. Don't include problems that are quite minor 3. There should be no more than 3 bullet points\n" +
            "Step 2: Based on the highlights extracted in Step 1, suggest a way to improve each of the problem in a very brief bullet point. NOTE: 1. There should be no more than bullet points than the highlights generated in Step 1 2. The bullet point should not include suggestions related to response 'Relevancy'', as they would be covered in different prompts 3. Don't repeat the suggestions 4. The tone of the text should be warm, humane, and humorous occsionally 3. Each bullet point should have no more than 20 words.\n" +
            "Notes: The 'waysToImprove' field array should not contain more than 3 bullet points\n" +
            "You must provide the results in the following JSON format:\n" +
            "{" +
            "delivery (json): { waysToImprove: [examples: 'Add a bit of personality to make the answer feel more relatable—professional, but not robotic!', 'Break the response into steps: challenge, approach, solution—makes it easy for anyone to follow.'], score: [float]: A score out of 10}," +
            "}"
        ),
      ],
      response_format: { type: "json_object" },
    });

    // Parse 'tip' string value from the response
    return parseFieldValue(completion, "delivery");
  };

  try {
    // Run all async functions concurrently
    const [feedback, overview, tip, relevance, delivery] = await Promise.all([
      getFeedback(),
      getOverview(),
      getTip(),
      getRelevance(),
      getDelivery(),
    ]);

    // Set results after both have completed
    feedback.overview = overview;
    feedback.tip = tip;
    feedback.summary.relevance = relevance;
    feedback.summary.delivery = delivery;

    req.results = feedback;
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
