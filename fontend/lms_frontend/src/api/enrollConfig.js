import axios from "axios";

const enrollClient = axios.create({
  baseURL: "/enroll", // Proxy sẽ chuyển /enroll -> http://localhost:8081/enroll
  withCredentials: false,
});

enrollClient.interceptors.request.use(
  (config) => {
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      accessToken = sessionStorage.getItem("accessToken");
    }

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

enrollClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default enrollClient;