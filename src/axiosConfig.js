// src/axiosConfig.js

import axios from "axios";

// 기본 axios 인스턴스에 글로벌 인터셉터 설정
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // 프로덕션 환경에서만 404 에러를 무시하도록 설정
    if (
      process.env.NODE_ENV === "production" && // 프로덕션 환경인지 확인
      error.response &&
      error.response.status === 404
    ) {
      console.warn("프로덕션에서 404 에러가 발생했습니다. 에러를 무시합니다.");
      return Promise.resolve(null); // 404 에러를 null로 처리하여 무시
    }
    // 개발 환경이나 다른 에러는 그대로 처리
    return Promise.reject(error);
  }
);

export default axios; // axios를 기본 설정과 함께 내보내기
