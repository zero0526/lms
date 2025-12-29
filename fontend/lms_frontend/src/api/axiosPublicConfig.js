import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const apiPublicClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false,
});

apiPublicClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Public API Error:", error);
    return Promise.reject(error);
  }
);

export default apiPublicClient;