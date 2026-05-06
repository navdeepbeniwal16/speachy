import backendApiClient from "./backendAPIClient.js";

class AttemptService {
  static async save(payload) {
    try {
      const response = await backendApiClient.post("/attempts", payload);
      return response.data;
    } catch (error) {
      console.error("AttemptService: Error saving attempt:", error);
      throw error;
    }
  }

  static async getByQuestion(questionKey) {
    try {
      const response = await backendApiClient.get("/attempts", {
        params: { questionKey },
        skipGlobalErrorHandler: true,
      });
      return response.data.attempts || [];
    } catch (error) {
      console.error("AttemptService: Error fetching attempts:", error);
      throw error;
    }
  }

  static async getSummaries() {
    try {
      const response = await backendApiClient.get("/attempts/summaries");
      return response.data.summaries || [];
    } catch (error) {
      console.error("AttemptService: Error fetching summaries:", error);
      throw error;
    }
  }
}

export default AttemptService;
