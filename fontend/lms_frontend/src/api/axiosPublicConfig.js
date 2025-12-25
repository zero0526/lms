import axios from "axios";

/**
 * Axios instance cho PUBLIC APIs (không cần authentication)
 * Sử dụng cho: Course details, Course outline public, Tags, etc.
 */
const apiPublicClient = axios.create({
  baseURL: "/api",
  withCredentials: false,
});

// KHÔNG có interceptor để thêm token
// CHỈ có interceptor xử lý response errors (nếu cần)
apiPublicClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Không redirect về login khi gặp 401 (vì đây là public API)
    console.error("Public API Error:", error);
    return Promise.reject(error);
  }
);

export default apiPublicClient;