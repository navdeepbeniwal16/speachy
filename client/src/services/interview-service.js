import backendApiClient from "./backendAPIClient.js";

class InterviewService {
  static async fetchBehaviouralQuestions(
    company,
    role,
    description,
    industry,
    requiredExperience
  ) {
    try {
      const response = await backendApiClient.post(
        "/interview/fetch-questions",
        {
          company: company,
          role: role,
          description: description,
          industry: industry,
          requiredExperience: requiredExperience,
        }
      );

      console.log("Response:", response);

      const responseData = response.data;
      if (!responseData) {
        throw new Error(
          "Response data not present in the backend api response"
        );
      }

      const questionsData = responseData.data;
      if (!questionsData || !questionsData.questions) {
        throw new Error(
          "Questions data not present in the backend api response"
        );
      }

      return questionsData.questions;
    } catch (error) {
      console.error(`InterviewService: Error fetching questions: ${error}`);
      throw error;
    }
  }

  static async fetchAudioResponseFeedback(
    questionText,
    audioResponseBlob,
    companyName,
    jobRole,
    jobDescription,
    industry,
    requiredExperience
  ) {
    const formData = new FormData();
    formData.append("file", audioResponseBlob, "audio-file.ogg");
    formData.append("questionText", questionText);
    formData.append("companyName", companyName);
    formData.append("jobRole", jobRole);
    formData.append("jobDescription", jobDescription);
    formData.append("industry", industry);
    formData.append("requiredExperience", requiredExperience);

    try {
      const response = await backendApiClient.post(
        "/interview/evaluate-response-audio",
        formData
      );

      // Directly access the parsed JSON from response.data
      if (response.status !== 200) {
        throw new Error("Request unsuccessful: " + response);
      }

      const data = response.data; // Axios automatically parses the JSON response

      if (!data.results) {
        throw new Error("Results not found in response payload: " + data);
      }

      const resultsObj = data.results;
      return resultsObj;
    } catch (error) {
      console.error("Failed to fetch audio response feedback:", error);
      return null;
    }
  }
}

export default InterviewService;
