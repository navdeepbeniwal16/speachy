import backendApiClient from "./backendAPIClient.js";

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
      const response = await fetch(
        "/impromptu-speaking/evaluate-response-audio",
        {
          method: "POST",
          headers: {},
          body: formData,
        }
      );

      if (response.status !== 200) {
        throw new Error("Request unsuccessful: " + response);
      }

      const data = await response.json();
      if (!data.results) {
        throw new Error("Results not found in response payload: " + response);
      }

      const resultsObj = data.results;
      return resultsObj;
    } catch (error) {
      console.error("Failed to fetch audio response feedback:", error);
      throw error; // Re-throw the error instead of returning null
    }
  }
}

export default ImpromptuSpeakingService;
