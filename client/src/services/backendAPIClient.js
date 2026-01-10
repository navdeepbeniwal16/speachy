import axios from "axios";
import { auth } from "./firebase";

let globalErrorHandler = null;

export const setGlobalApiErrorHandler = (handler) => {
  globalErrorHandler = handler;
};

const extractServerMessage = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;

  const candidates = [
    data.message,
    data.error,
    data.error?.message,
    data.errorDescription,
    data.errorDescription?.message,
    data.errorDescription?.error?.message,
  ];

  return candidates.find((candidate) => typeof candidate === "string") || "";
};

const getApiErrorMessage = ({ status, data, hasResponse }) => {
  if (!hasResponse) {
    return "Network error. Check your connection and try again.";
  }

  const serverMessage = extractServerMessage(data);
  const messageText = String(serverMessage || "").toLowerCase();

  if (status === 401 || status === 403) {
    return "Your session has expired or is invalid. Please sign in again.";
  }

  if (status === 429) {
    if (
      messageText.includes("insufficient_quota") ||
      messageText.includes("quota")
    ) {
      return "Usage limit reached. Please try again later.";
    }
    return "Too many requests. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return "Server error. Please try again later.";
  }

  return serverMessage || "Request failed. Please try again.";
};

const backendApiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Interceptor to add the token to each request
backendApiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const idToken = await user.getIdToken();
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
    const status = error?.response?.status;
    const data = error?.response?.data;
    const hasResponse = Boolean(error?.response);
    const userMessage = getApiErrorMessage({ status, data, hasResponse });

    const shouldNotify =
      !error?.config?.skipGlobalErrorHandler &&
      (!hasResponse ||
        status === 401 ||
        status === 403 ||
        status === 429 ||
        status >= 500);

    if (shouldNotify && typeof globalErrorHandler === "function") {
      globalErrorHandler({ status, message: userMessage, rawError: error });
    }

    error.userMessage = userMessage;
    error.apiStatus = status;

    console.error("REST API Client Network Error:", error.response || error);
    return Promise.reject(error);
  }
);

export default backendApiClient;
