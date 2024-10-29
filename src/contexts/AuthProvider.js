import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import qs from "qs"; // 쿼리 스트링 변환을 위한 qs 라이브러리

const AuthContext = createContext({
  user: null,
  isPending: true,
  login: () => {},
  logout: () => {},
  updateMe: () => {},
});

export function AuthProvider({ children }) {
  const [values, setValues] = useState({
    user: null,
    isPending: true,
  });

  async function getMe() {
    setValues((prevValues) => ({
      ...prevValues,
      isPending: true,
    }));
    let nextUser = null;

    try {
      const res = await axios.get("/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // JWT 토큰을 Authorization 헤더에 포함
          accept: "application/json", // 응답 형식을 JSON으로 설정
        },
      });
      nextUser = res.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await axios.post("/auth/token");
        const res = await axios.get("/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            accept: "application/json",
          },
        });
        nextUser = res.data;
      }
    } finally {
      setValues((prevValues) => ({
        ...prevValues,
        user: nextUser,
        isPending: false,
      }));
    }
  }

  async function login({ email, password }) {
    const data = {
      grant_type: "password",
      username: email, // username 필드에 email 값 전달
      password: password,
      scope: "",
      client_id: "string",
      client_secret: "string",
    };

    const { data: responseData } = await axios.post(
      "/auth/token",
      qs.stringify(data), // 데이터를 쿼리 스트링 형식으로 변환
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // 요청 헤더 설정
        },
      }
    );

    localStorage.setItem("accessToken", responseData.access_token); // access_token 저장
    await getMe();
  }

  async function logout() {
    localStorage.removeItem("accessToken");
    setValues((prevValues) => ({
      ...prevValues,
      user: null,
    }));
  }

  async function updateMe(formData) {
    const res = await axios.patch("/users/me", formData);
    const nextUser = res.data;
    setValues((prevValues) => ({
      ...prevValues,
      user: nextUser,
    }));
  }

  useEffect(() => {
    getMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: values.user,
        isPending: values.isPending,
        login,
        logout,
        updateMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(required) {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error("반드시 AuthProvider 안에서 사용해야 합니다.");
  }

  useEffect(() => {
    if (required && !context.user && !context.isPending) {
      navigate("/login");
    }
  }, [context.user, context.isPending, navigate, required]);

  return context;
}
