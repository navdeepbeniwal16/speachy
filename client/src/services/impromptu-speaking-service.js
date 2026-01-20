import backendApiClient from "./backendAPIClient.js";
import { getAuth } from "firebase/auth";

class ImpromptuSpeakingService {
  static async fetchPrompt() {
    try {
      const response = await backendApiClient.get("/impromptu-speaking/prompt");

      console.log("Response:", response);

      const responseData = response.data;
      if (!responseData) {
        throw new Error(
          "Response data not present in the backend api response"
        );
      }

      const promptData = responseData.data;
      if (!promptData || !promptData.prompt) {
        throw new Error("Prompt not present in the backend api response");
      }

      return promptData;
    } catch (error) {
      console.error(`InterviewService: Error fetching questions: ${error}`);
      throw error;
    }
  }

  static async fetchAudioResponseFeedback(promptText, audioResponseBlob) {
    const formData = new FormData();
    formData.append("file", audioResponseBlob, "audio-file.ogg");
    formData.append("promptText", promptText);

    try {
      const response = await backendApiClient.post(
        "/impromptu-speaking/evaluate-response-audio",
        formData
      );

      if (response.status !== 200) {
        throw new Error("Request unsuccessful: " + response.status);
      }

      const data = response.data;
      if (!data?.results) {
        throw new Error("Results not found in response payload");
      }

      return data.results;
    } catch (error) {
      console.error("Failed to fetch audio response feedback:", error);
      throw error; // Re-throw the error instead of returning null
    }
  }
}

export default ImpromptuSpeakingService;
