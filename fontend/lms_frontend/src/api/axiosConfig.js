import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // Enable cookies
});

apiClient.interceptors.request.use(
  (config) => {
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      accessToken = sessionStorage.getItem("accessToken");
    }

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      console.log('Using token from storage');
    } else {
      console.log('Using cookie-based auth');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Token expired, attempting refresh...');

        // Try refresh token from storage (normal login)
        const refreshToken = localStorage.getItem('refreshToken') || 
                            sessionStorage.getItem('refreshToken');

        if (refreshToken) {
          // Normal login: refresh with token
          console.log('🔑 Refreshing with storage token');
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );

          const newAccessToken = response.data.data.accessToken;

          if (localStorage.getItem('accessToken')) {
            localStorage.setItem('accessToken', newAccessToken);
          } else {
            sessionStorage.setItem('accessToken', newAccessToken);
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          // OAuth login: refresh with cookie
          console.log('🍪 Refreshing with cookie');
          await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
          
          // Retry original request (new token in cookie)
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Refresh failed');
        
        // Clear all credentials
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("user");
        
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;