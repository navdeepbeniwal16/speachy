import backendApiClient from "./backendAPIClient.js";

class UserService {
  static async postUserFeedback({ rating, feedbackText }) {
    try {
      const response = await backendApiClient.post("me/feedback", {
        rating,
        feedbackText,
      });

      const responseData = response.data;
      if (!responseData || responseData.status !== "success") {
        throw new Error("Unexpected response from backend");
      }

      return responseData;
    } catch (error) {
      console.error("UserService: Failed to post user feedback", error);
      throw error;
    }
  }
}

export default UserService;
