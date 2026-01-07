import backendApiClient from "./backendAPIClient.js";

class StreakService {
  static async record(sessionType, tz) {
    const res = await backendApiClient.post("/streak/record", { sessionType, tz });
    return res.data;
  }

  static async summary() {
    const res = await backendApiClient.get("/streak/summary");
    return res.data;
  }

  static async activity(from, to) {
    const res = await backendApiClient.get("/streak/activity", { params: { from, to } });
    return res.data;
  }
}

export default StreakService;

