import axios from "axios";
const BASE_URL = process.env.REACT_APP_BASE_URL; // .env에서 가져온 서버 URL

const instance = axios.create({
  baseURL: `${BASE_URL}`,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await instance.post("/auth/token");
        localStorage.setItem("accessToken", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return instance(originalRequest);
      } catch (err) {
        console.error("Token refresh failed", err);
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
