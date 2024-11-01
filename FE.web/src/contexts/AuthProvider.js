import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import qs from "qs"; // 쿼리 스트링 변환을 위한 qs 라이브러리
import "../axiosConfig"; // axios 설정 파일을 import하여 인터셉터 설정 적용

const AuthContext = createContext({
  user: null,
  isPending: true,
  login: () => {},
  logout: () => {},
  updateMe: () => {},
});

const BASE_URL = process.env.REACT_APP_BASE_URL; // .env에서 가져온 서버 URL

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

      // avatar가 상대 경로라면 서버 URL과 결합하여 절대 경로로 설정
      if (nextUser.avatar && !nextUser.avatar.startsWith("http")) {
        nextUser.avatar = `${BASE_URL}/${nextUser.avatar}`;
      }
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
        if (nextUser.avatar) {
          nextUser.avatar = `${BASE_URL}/${nextUser.avatar}`;
        }
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
    const { name, avatar } = formData;

    // 이름 업데이트 - 쿼리 파라미터 사용
    if (name) {
      try {
        await axios.patch(
          `/users/me/name?name=${encodeURIComponent(name)}`, // 쿼리 파라미터로 name 전달
          null,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              accept: "application/json",
            },
          }
        );
      } catch (error) {
        console.error("이름 업데이트 오류:", error);
      }
    }

    // 아바타 업데이트
    if (avatar) {
      const avatarFormData = new FormData();
      avatarFormData.append("avatar", avatar);

      try {
        await axios.patch("/users/me/avatar", avatarFormData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "multipart/form-data",
          },
        });

        // 아바타 업데이트 후 새로운 URL을 가져옴
        const avatarRes = await axios.get("/users/me/avatar", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            accept: "*/*",
          },
          responseType: "blob",
        });
        const newAvatarURL = URL.createObjectURL(avatarRes.data);
        setValues((prevValues) => ({
          ...prevValues,
          user: { ...prevValues.user, avatar: newAvatarURL },
        }));
      } catch (error) {
        console.error("아바타 업데이트 오류:", error);
      }
    }

    // 모든 업데이트 후 최신 사용자 정보 가져오기
    try {
      const res = await axios.get("/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          accept: "application/json",
        },
      });
      const nextUser = res.data;
      setValues((prevValues) => ({
        ...prevValues,
        user: nextUser,
      }));
    } catch (error) {
      console.error("사용자 정보 가져오기 오류:", error);
    }
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
