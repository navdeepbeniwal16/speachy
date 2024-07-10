import axios from "axios";

const backendApiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

backendApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    console.error("REST API Client Network Error:", error.response);
    return Promise.reject(error);
  }
);

export default backendApiClient;
