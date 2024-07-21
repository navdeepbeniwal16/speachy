import backendApiClient from "./backendAPIClient.js";

class PaymentsService {
  static async createCheckoutSession(priceId, userUID) {
    try {
      const response = await backendApiClient.post(
        "/payments/create-checkout-session",
        {
          priceId: priceId,
          userUID: userUID,
        }
      );
      console.log("Response:", response);

      const responseData = response.data;
      if (!responseData) {
        throw new Error(
          "Response data not present in the backend api response"
        );
      }

      return responseData;
    } catch (error) {
      console.error(`InterviewService: Error fetching questions: ${error}`);
      throw error;
    }
  }
}

export default PaymentsService;
