import backendApiClient from "./backendAPIClient";

class CollectionsService {
  static async getAll() {
    const res = await backendApiClient.get("/collections");
    return res.data.collections;
  }

  static async getQuestions(collectionId) {
    const res = await backendApiClient.get(`/collections/${collectionId}/questions`);
    return res.data; // { collection, questions }
  }
}

export default CollectionsService;
