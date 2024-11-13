import axios from "axios";
import { getAuth } from "firebase/auth";

const backendApiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add the token to each request
backendApiClient.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const idToken = await user.getIdToken(); // Wait for the token
      config.headers.Authorization = `Bearer ${idToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for global error handling
backendApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("REST API Client Network Error:", error.response);
    return Promise.reject(error);
  }
);

export default backendApiClient;
