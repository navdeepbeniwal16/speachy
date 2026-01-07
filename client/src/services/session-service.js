import backendApiClient from "./backendAPIClient.js";

class SessionService {
  static async stats() {
    const res = await backendApiClient.get("/sessions/stats");
    return res.data;
  }
}

export default SessionService;

