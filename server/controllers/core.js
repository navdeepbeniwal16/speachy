// Load environment variables
require("dotenv").config();

// Dependencies
const fs = require("fs");
const OpenAI = require("openai");

// Constants
const TEMPORARY_AUDIO_FILENAME = "temp_audio_file.mp3";

// Initialise services
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_ACCESS_KEY,
  dangerouslyAllowBrowser: false,
});

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
      prompt:
        "Umm, let me think like, hmm... Okay, here's what I'm, like, thinking.",
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

module.exports = { transcribeAudio };
