// Load environment variables
require("dotenv").config();

// Dependencies
const fs = require("fs");
const OpenAI = require("openai");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const winston = require("winston");
const firebaseAdmin = require("../configs/firebase-admin.js");
const { getFirestore } = require("firebase-admin/firestore");

// Constants
const TEMPORARY_AUDIO_FILENAME = "temp_audio_file.mp3";

// Firestore constants for preselected questions
const INTERVIEW_QUESTIONS_COLLECTION = "interview_questions";

// Logging setup (aligned with impromptu-speaking route)
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: "interview" },
  transports: [new winston.transports.Console({ format: winston.format.simple() })],
});

// Initialise services
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_ACCESS_KEY,
  dangerouslyAllowBrowser: false,
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Firestore db
const db = getFirestore(firebaseAdmin);

// Fetch preselected questions from Firestore (single collection, optional rank ordering)
const DEFAULT_PRESELECTED_LIMIT = Number(
  process.env.INTERVIEW_PRESELECTED_LIMIT || 50
);

const normalizeQuestion = (q) => {
  if (!q || typeof q.question !== "string" || q.question.trim() === "") {
    return null;
  }
  return {
    question: q.question,
    tags: Array.isArray(q.tags) ? q.tags : ["general"],
    difficultyLevel:
      typeof q.difficultyLevel === "string" ? q.difficultyLevel : "medium",
    isAIGenerated: false,
  };
};

const getPreSelectedQuestions = async () => {
  logger.debug("Fetching curated interview questions from Firestore...");
  let snapshot;
  try {
    // Preferred: active == true ordered by rank
    snapshot = await db
      .collection(INTERVIEW_QUESTIONS_COLLECTION)
      .where("active", "==", true)
      .orderBy("rank")
      .limit(DEFAULT_PRESELECTED_LIMIT)
      .get();
  } catch (err) {
    logger.warn(
      "Rank ordering unavailable or index missing; falling back to basic active filter.",
      { error: err.message }
    );
    snapshot = await db
      .collection(INTERVIEW_QUESTIONS_COLLECTION)
      .where("active", "==", true)
      .limit(DEFAULT_PRESELECTED_LIMIT)
      .get();
  }

  const questions = snapshot.docs
    .map((d) => normalizeQuestion(d.data()))
    .filter((q) => q !== null);

  logger.info(`Fetched ${questions.length} curated interview questions.`);
  return questions;
};

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
          'Based on the information provided, what are some most probable behavioral interview questions? Please provide them in the following json format: { questions: [{"question": "question string in one line", "tags": [string of associated tags], "difficultyLevel": "easy | medium | hard"}], isAIGenerated: true,}',
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

  questions.map((question) => (question.isAIGenerated = true));

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
    const predefinedQuestions = await getPreSelectedQuestions();

    const generatedQuestions = await getQuestionsSet(
      company,
      role,
      description,
      industry,
      requiredExperience
    );

    const allQuestions = [...predefinedQuestions, ...generatedQuestions];

    console.log("interview.js : Questions generated successfully!");

    res.status(200).json({
      message: "Questions generated successfully.",
      data: {
        questions: allQuestions,
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

  // const getFeedback = async () => {
  //   const completion = await openai.chat.completions.create({
  //     model: model,
  //     messages: [
  //       systemPrompt,
  //       userPrompt,
  //       {
  //         role: "user",
  //         content:
  //           "Based on the information provided, CRITICALLY evaluate the response on the following aspects: \n" +
  //           "Relevance: How well the response addresses the question. Include specific examples of what was done well and areas for improvement.\n" +
  //           "Delivery: Clarity and fluency of the response. Provide detailed feedback on speaking pace, clarity, and use of pauses.\n" +
  //           "Tone: Appropriateness of tone given the formal setting. Comment on professionalism, enthusiasm, and engagement level.\n" +
  //           "Please provide the results in the following JSON format:\n" +
  //           "{ summary (json): {" +
  //           "tone (json): {waysToImprove: ['What was done well', 'What was lacking', 'Suggestions for improvement'], score: [float]: A score out of 10}" +
  //           "}," +
  //           "detailedFeedback (string): overall feedback on the whole of the response taking into account the requirements of the role provided. It should include specific examples of areas to improve and suggestions for how the answer could be better. Ensure the detailed feedback is comprehensive and addresses multiple aspects of the response in depth. Use a constructive tone to encourage improvement." +
  //           "Clearly state what the user did well, what they lacked, and specific suggestions for improvement. For example, 'To improve relevance, you can...' or 'A good example of clarity in delivery is...' should be included in the paragraph.\n" +
  //           "overview (string) : Praise words, very breifly describe positive thing about the response and example eg: Well done, you gave an engaging response by mentioning your pet Toby!," +
  //           "tip (string) : Next time try [insert advice] to improve your response" +
  //           "fillers (integer): number of filler words," +
  //           "}",
  //       },
  //     ],
  //     response_format: { type: "json_object" },
  //   });

  //   if (!Array.isArray(completion.choices) || completion.choices.length === 0) {
  //     throw new Error(
  //       "Error occurred in OpenAI chat API response while generating evaluating response for the question and role details."
  //     );
  //   }

  //   const evaluationResultsRawJSON = completion.choices[0].message.content;
  //   const evaluationResults = JSON.parse(evaluationResultsRawJSON);
  //   return evaluationResults;
  // };

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
          "You are evaluating how well a candidate’s response answers a given interview question. Focus strictly on **relevance** — not structure, sentiment, tone, or storytelling quality.\n\n" +
            "Begin by classifying the question type:\n" +
            "- If the question asks about a specific past experience (e.g., 'Tell me about a time...'), treat it as a **Behavioral** question.\n" +
            "- If the question is hypothetical, reflective, or about preferences (e.g., 'What motivates you?', 'What would you do if...?'), treat it as a **Non-Behavioral** question.\n\n" +
            "If the response is **highly relevant** (score of 9.0 or above), you must **not provide any improvement suggestions** — the response is already strong in terms of relevance.\n" +
            "Do not suggest changes just because something *more* could have been said. If the response clearly answers the question, that is sufficient.\n\n" +
            "Use the following relevance criteria for your evaluation:\n\n" +
            "FOR BEHAVIORAL QUESTIONS:\n" +
            "- Direct Match: Does the response clearly address the specific behavior or trait asked about?\n" +
            "- Trait Demonstration: Does the candidate’s action in the response reflect the target skill or competency?\n" +
            "- Context Fit: Is the situation appropriate in scale and setting (e.g., workplace, team challenge)?\n" +
            "- Completeness: If the question has multiple parts, are they all answered?\n" +
            "- Specificity: Is the response a real story (not vague habits or general traits)?\n\n" +
            "FOR NON-BEHAVIORAL QUESTIONS:\n" +
            "- Directness: Does the response clearly address the intent of the question?\n" +
            "- Conceptual Fit: Is the content topically appropriate (e.g., a motivation question discusses what drives them)?\n" +
            "- Completeness: Are all parts of the question addressed?\n" +
            "- Content Relevance: Is the answer focused and on-topic?\n" +
            "- Avoidance of Buzzwords: Does the answer avoid filler or vague, generic phrases?\n\n" +
            "Approach to follow:\n" +
            "Step 1: If the response has meaningful relevance gaps (based on the criteria above), list up to 3 bullet points identifying the issues. If no meaningful gaps exist, skip this step entirely.\n" +
            "Step 2: For each issue in Step 1, provide a brief, warm, and practical improvement suggestion (max 25 words). Use a constructive, occasionally witty tone.\n\n" +
            "Important:\n" +
            "- Do NOT provide suggestions if the score is 8.0 or higher — treat it as a strong, sufficiently relevant answer.\n" +
            "- Do NOT generate feedback just because more could have been said — only respond when something **is missing** based on the criteria.\n" +
            "- Only critique if the response fails to directly and clearly answer the question.\n" +
            "- Do NOT suggest linking to job role, company, or mission unless the question explicitly asks for it.\n" +
            "- Do NOT critique clarity, storytelling, phrasing, delivery style, grammar, emotional tone, or authenticity.\n" +
            "- Do NOT provide more than 2 improvement suggestions, even if 3 issues are listed.\n\n" +
            "Your output must be in the following JSON format:\n" +
            "{\n" +
            '  "relevance": {\n' +
            '    "waysToImprove": ["...", "..."],\n' +
            '    "exampleResponseExcerpt": "Excerpt that shows the relevance issue",\n' +
            '    "score": float (0–10, e.g., 8.5)\n' +
            "  }\n" +
            "}"
        ),
      ],
      response_format: { type: "json_object" },
    });

    // Parse 'tip' string value from the response
    return parseFieldValue(completion, "relevance");
  };

  const getStructure = async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        systemPrompt,
        userPrompt,
        getInstructionPrompt(
          "You are evaluating how well-structured a candidate’s response is to an interview question. Focus **only on structure** — this includes logical flow, storytelling coherence, and emotional alignment. Do **not** evaluate content relevance, language quality, or tone beyond what’s required for structure.\n\n" +
            "Start by identifying the question type:\n" +
            "- If the question asks about a specific past experience (e.g., 'Tell me about a time...'), treat it as a **Behavioral** question.\n" +
            "- If the question is reflective, motivational, or hypothetical (e.g., 'What motivates you?', 'What would you do if...?'), treat it as a **Non-Behavioral** question.\n\n" +
            "Use the following criteria to evaluate structure:\n\n" +
            "FOR BEHAVIORAL QUESTIONS:\n" +
            "- **Logical Flow**: Does the response follow a clear beginning-to-end sequence (e.g., STAR or similar)?\n" +
            "- **Focused Narrative**: Does it stay on one cohesive story without losing direction?\n" +
            "- **Clear Transitions**: Are there smooth connections between different stages of the story?\n" +
            "- **Detail and Pacing**: Are key moments fleshed out while avoiding unnecessary tangents?\n" +
            "- **Emotional Alignment**: Does the reflection and tone match the situation being described?\n\n" +
            "FOR NON-BEHAVIORAL QUESTIONS:\n" +
            "- **Clarity of Thought**: Is the response organized from introduction to conclusion?\n" +
            "- **Thematic Consistency**: Does it stay focused on a central idea without drifting?\n" +
            "- **Progression**: Does it build meaningfully toward an insight or realization?\n" +
            "- **Balance of Depth**: Are ideas explained with enough detail without rambling?\n" +
            "- **Tone Resonance**: Does the emotional tone support the message being conveyed?\n\n" +
            "Evaluation Approach:\n" +
            "Step 1: If there are structural issues, identify up to 3 in a bullet list. If the structure is **clearly strong**, skip this step.\n" +
            "Step 2: For each issue, provide a short and practical suggestion (max 25 words). Keep the tone constructive and warm.\n\n" +
            "Important Rules:\n" +
            "- If the score is **8.0 or above**, do **not** suggest improvements. The structure is solid — let it be.\n" +
            "- Only point out issues that are **noticeable or disruptive**. Don’t nitpick just because a sentence could be tighter.\n" +
            "- Focus strictly on structural aspects — don’t judge clarity of speech, grammar, or relevance.\n" +
            "- Never suggest more than **2 improvements**, even if you listed 3 issues.\n\n" +
            "Your response must follow this JSON format:\n" +
            "{\n" +
            '  "structure": {\n' +
            '    "waysToImprove": ["...", "..."],\n' +
            '    "exampleResponseExcerpt": "Excerpt that shows the structure issue",\n' +
            '    "score": float (0–10, e.g., 7.5)\n' +
            "  }\n" +
            "}"
        ),
      ],
      response_format: { type: "json_object" },
    });

    // Parse 'tip' string value from the response
    return parseFieldValue(completion, "structure");
  };

  const getSentiment = async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        systemPrompt,
        userPrompt,
        getInstructionPrompt(
          "Your response should provide an expert-level critical evaluation of the sentiment alignment of the given answer to the question.\n" +
            "Approach to follow:\n" +
            "Step 1: Identify up to two key issues that make the response's sentiment less aligned with the given question and situation Notes: 1. Judge the response from the eyes of a Hiring Manager 2. Don't include problems that are quite minor 3. There should be no more than 2 bullet points\n" +
            "Step 2: Based on the highlights extracted in Step 1, suggest a way to improve each of the problem in a very brief bullet point. NOTE: 1. There should be no more than bullet points than the highlights generated in Step 1 2. The bullet point should not include suggestions related to response 'Relevancy'', as they would be covered in different prompts 3. Don't repeat the suggestions 4. The tone of the text should be warm, humane, and humorous occsionally 3. Each bullet point should have no more than 20 words.\n" +
            "Notes: The 'waysToImprove' field array should not contain more than 2 bullet points\n" +
            "You must provide the results in the following JSON format:\n" +
            "{" +
            "sentiment (json): { waysToImprove: [examples: 'Use more expressive language to boost engagement.', 'Add a relatable touch by sharing personal feelings' ], exampleResponseExcerpt: 'Honestly, it was a bit of a wild ride, but it felt great solving it with the team', score: score: [float]: A score out of 10 eg: 4:653}," +
            "}"
        ),
      ],
      response_format: { type: "json_object" },
    });

    // Parse 'tip' string value from the response
    return parseFieldValue(completion, "sentiment");
  };

  const getAuthenticity = async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        systemPrompt,
        userPrompt,
        getInstructionPrompt(
          "You are evaluating the **authenticity and personality alignment** of a candidate’s response to an interview question. Focus **only on authenticity** — this includes how genuine, personal, and uniquely individual the response feels. Do **not** evaluate structure, relevance, grammar, or sentiment.\n\n" +
            "Start by identifying the question type:\n" +
            "- If the question asks about a specific past experience (e.g., 'Tell me about a time...'), treat it as a **Behavioral** question.\n" +
            "- If the question is reflective, motivational, or hypothetical (e.g., 'What motivates you?', 'What would you do if...?'), treat it as a **Non-Behavioral** question.\n\n" +
            "Use the following criteria to evaluate authenticity:\n\n" +
            "FOR BEHAVIORAL QUESTIONS:\n" +
            "- **Personal Anchoring**: Does the story include specific moments, feelings, or details that make it feel lived and personal?\n" +
            "- **Unique Voice**: Does the speaker express the experience in a way that reflects their personality, not just a textbook or AI generated answer?\n" +
            "- **Emotional Honesty**: Does the response reflect real emotions, motivations, or convictions — not just what they think the interviewer wants to hear?\n" +
            "- **Avoids Clichés**: Is the language grounded in real experience instead of vague phrases like 'I’m a team player'?\n\n" +
            "FOR NON-BEHAVIORAL QUESTIONS:\n" +
            "- **Personal Motivation**: Are there clear, authentic reasons or stories behind what the speaker believes or chooses?\n" +
            "- **Distinct Perspective**: Does the answer feel like something only *this* person would say?\n" +
            "- **Conversational Warmth**: Is the tone human and relaxed, not overly polished or stiff?\n" +
            "- **Realism & Humility**: Does the speaker show honest self-awareness — not trying to sound perfect?\n" +
            "- **Buzzword-Free**: Does it avoid relying on generic or corporate phrases that could apply to anyone?\n\n" +
            "Evaluation Approach:\n" +
            "Step 1: If there are authenticity issues, identify up to **2** in a bullet list. If the response feels **genuinely authentic**, skip this step.\n" +
            "Step 2: For each issue, provide a short and helpful suggestion (max 20 words). Keep the tone warm, supportive, and slightly human.\n\n" +
            "Important Rules:\n" +
            "- If the score is **8.0 or above**, do **not** suggest improvements. The authenticity is strong — let it breathe.\n" +
            "- Only flag things that **genuinely hurt authenticity or make it feel generic**. Don’t nitpick.\n" +
            "- Stay focused on **personal expression and voice** — do not critique structure, storytelling, or factual accuracy.\n" +
            "- Never suggest more than **2 improvements**, even if multiple issues are found.\n\n" +
            "Your response must follow this JSON format:\n" +
            "{\n" +
            '  "authenticity": {\n' +
            '    "waysToImprove": ["...", "..."],\n' +
            '    "exampleResponseExcerpt": "Excerpt that shows the authenticity issue",\n' +
            '    "score": float (0–10, e.g., 7.5)\n' +
            "  }\n" +
            "}"
        ),
      ],
      response_format: { type: "json_object" },
    });

    // Parse 'tip' string value from the response
    return parseFieldValue(completion, "authenticity");
  };

  const getDetailedaFeedback = async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        systemPrompt,
        userPrompt,
        getInstructionPrompt(
          "Your response needs to provide a detailed feedback on the whole of the response taking into account the requirements of the role provided. It should include specific examples of areas to improve and suggestions for how the answer could be better. Ensure the detailed feedback is comprehensive and addresses multiple aspects of the response in depth. Use a constructive tone to encourage improvement.\n" +
            "Notes: The overview field text should be in not more than 30 words\n" +
            "You must provide the results in the following JSON format:\n" +
            "{" +
            'detailedFeedback (string) : "Placeholder for generated detailed feedback"' +
            "}"
        ),
      ],
      response_format: { type: "json_object" },
    });

    // Parse 'overview' string value from the response
    return parseFieldValue(completion, "detailedFeedback");
  };

  try {
    // Run all async functions concurrently
    const [
      overview,
      tip,
      relevance,
      structure,
      // sentiment,
      authenticity,
      detailedFeedback,
    ] = await Promise.all([
      getOverview(),
      getTip(),
      getRelevance(),
      getStructure(),
      // getSentiment(),
      getAuthenticity(),
      getDetailedaFeedback(),
    ]);

    // Set results after both have completed
    const feedback = {
      summary: {},
    };
    feedback.overview = overview;
    feedback.tip = tip;
    feedback.detailedFeedback = detailedFeedback;
    feedback.summary.relevance = relevance;
    feedback.summary.structure = structure;
    // feedback.summary.sentiment = sentiment;
    feedback.summary.authenticity = authenticity;

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

router.post(
  "/evaluate-response-text",
  evaluateResponse,
  async (req, res, next) => {
    const results = req.results;
    const { questionText } = req.body;

    // Record session after successful evaluation
    try {
      const sessionResponse = await fetch(
        `${req.protocol}://${req.get("host")}/user/sessions/record`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.authorization,
          },
          body: JSON.stringify({
            sessionType: "interview",
            questionText: questionText,
          }),
        }
      );

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        console.log("Session recorded successfully:", sessionData);
      } else {
        console.warn(
          "Failed to record session, but evaluation completed successfully"
        );
      }
    } catch (error) {
      console.error("Error recording session:", error);
      // Don't fail the evaluation if session recording fails
    }

    res.json({
      message: "Question response successfully evaluated",
      results: results,
    });
  }
);

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
  async (req, res, next) => {
    const feedback = req.results;
    const transcription = req.transcription;
    const { questionText } = req.body;

    // Record session after successful evaluation
    try {
      const sessionResponse = await fetch(
        `${req.protocol}://${req.get("host")}/user/sessions/record`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.authorization,
          },
          body: JSON.stringify({
            sessionType: "interview",
            questionText: questionText,
          }),
        }
      );

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        console.log("Session recorded successfully:", sessionData);
      } else {
        console.warn(
          "Failed to record session, but evaluation completed successfully"
        );
      }
    } catch (error) {
      console.error("Error recording session:", error);
      // Don't fail the evaluation if session recording fails
    }

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
