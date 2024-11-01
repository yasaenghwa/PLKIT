import ReactDOM from "react-dom";
import React from "react";
import Main from "./Main";
import "./index.css";
import { AuthProvider } from "./contexts/AuthProvider"; // AuthProvider 가져오기
import "./axiosConfig"; // axios 설정 파일을 import하여 인터셉터 설정 적용

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <Main />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
