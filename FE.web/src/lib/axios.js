import axios from "axios";
const BASE_URL = process.env.REACT_APP_BASE_URL; // .env에서 가져온 서버 URL

if (!BASE_URL) {
  console.error("환경 변수 REACT_APP_BASE_URL이 설정되지 않았습니다.");
  alert("시스템 설정 오류: 기본 URL이 없습니다. 관리자에게 문의하세요.");
  throw new Error("환경 변수 REACT_APP_BASE_URL 누락");
}

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

    // 네트워크 오류 처리
    if (!navigator.onLine) {
      alert("네트워크 연결이 끊어졌습니다. 인터넷 상태를 확인해주세요.");
      return Promise.reject(new Error("Network Error"));
    }

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

    // 기타 상태 코드 처리
    handleHttpError(error.response?.status, error.response?.data);

    return Promise.reject(error);
  }
);
// 상태 코드별 처리 함수
function handleHttpError(status, data) {
  switch (status) {
    case 400:
      console.warn(`요청 오류 (400): ${data?.message || "잘못된 요청입니다."}`);
      break;
    case 403:
      console.warn(`권한 오류 (403): ${data?.message || "권한이 없습니다."}`);
      alert("이 작업을 수행할 권한이 없습니다.");
      break;
    case 404:
      console.warn(
        `리소스 없음 (404): ${
          data?.message || "요청한 리소스를 찾을 수 없습니다."
        }`
      );
      break;
    case 500:
      console.error(
        `서버 오류 (500): ${data?.message || "서버에서 오류가 발생했습니다."}`
      );
      alert("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      break;
    default:
      console.error(
        `알 수 없는 오류 (${status}): ${
          data?.message || "알 수 없는 오류입니다."
        }`
      );
  }
}

export default instance;
