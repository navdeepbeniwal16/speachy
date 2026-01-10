import backendApiClient from "./backendAPIClient.js";

class SessionService {
  static async stats(from, to) {
    const params = from && to ? { from, to } : undefined;
    const res = await backendApiClient.get("/sessions/stats", { params });
    return res.data;
  }
}

export default SessionService;
