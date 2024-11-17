import mock from "./mock.json";
import { v4 as uuidv4 } from "uuid";

import axios from "axios";
import "../axiosConfig"; // axios 설정 파일을 import하여 인터셉터 설정 적용
const BASE_URL = process.env.REACT_APP_BASE_URL; // .env에서 가져온 서버 URL

//console.log("JWT Token:", localStorage.getItem("accessToken"));

// 4. 커뮤니티 게시글 이미지 업로드 함수
export async function uploadCommunityImage(communityId, file) {
  const formData = new FormData();
  formData.append("file", file); // 파일을 FormData에 추가

  try {
    const response = await axios.post(
      `${BASE_URL}/communities/${communityId}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data; // 업로드된 이미지 정보 반환
  } catch (error) {
    console.error("커뮤니티 이미지 업로드 오류:", error);
    return null;
  }
}

// 5. 커뮤니티 게시글 이미지 조회 함수
export async function fetchCommunityImage(communityId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/communities/${communityId}/image`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        responseType: "blob", // 이미지 데이터를 blob으로 받아옴
      }
    );
    return URL.createObjectURL(response.data); // Blob 데이터를 URL로 변환하여 반환
  } catch (error) {
    console.error("커뮤니티 이미지 조회 오류:", error);
    return null;
  }
}

// 1. 커뮤니티 목록 가져오기 (API 요청으로 변경)
export async function getCommunitys(keyword) {
  try {
    const response = await axios.get(`${BASE_URL}/communities`, {
      params: { keyword },
    });
    return response.data;
  } catch (error) {
    console.error("커뮤니티 목록 가져오기 오류:", error);
    return [];
  }
}

// 2. 특정 커뮤니티 게시글 가져오기 (API 요청으로 변경)
export async function getCommunityById(communityId) {
  try {
    const response = await axios.get(`${BASE_URL}/communities/${communityId}`);
    return response.data;
  } catch (error) {
    console.error("커뮤니티 게시글 가져오기 오류:", error);
    return null;
  }
}

// 1. 새로운 커뮤니티 게시글 추가 함수
export async function addCommunity({ title, content, writer_id }) {
  try {
    const response = await axios.post(
      `${BASE_URL}/communities/`,
      {
        title,
        content,
        writer_id, // 사용자 ID 전달
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // JWT 토큰으로 인증
        },
      }
    );
    return response.data; // 생성된 게시글 데이터 반환
  } catch (error) {
    console.error("커뮤니티 게시글 추가 오류:", error);
    return null;
  }
}

// 2. 커뮤니티 게시글 수정 함수
export async function updateCommunity(communityId, { title, content }) {
  try {
    const response = await axios.patch(
      `${BASE_URL}/communities/${communityId}`,
      {
        title,
        content,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data; // 수정된 게시글 데이터 반환
  } catch (error) {
    console.error("커뮤니티 게시글 수정 오류:", error);
    return null;
  }
}

// 3. 커뮤니티 게시글 삭제 함수
export async function deleteCommunity(communityId) {
  try {
    await axios.delete(`${BASE_URL}/communities/${communityId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return true; // 성공 시 true 반환
  } catch (error) {
    console.error("커뮤니티 게시글 삭제 오류:", error);
    return false;
  }
}

const WISHLIST_KEY = "codethat-wishlist";

export function getWishlistSlugs() {
  const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  return Array.isArray(wishlist) ? wishlist : [];
}

export function addWishlist(marketSlug) {
  if (!marketSlug) {
    console.error("유효하지 않은 marketSlug입니다:", marketSlug);
    return false;
  }

  const wishlist = getWishlistSlugs();

  if (!wishlist.includes(marketSlug)) {
    wishlist.push(marketSlug);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    return true;
  }

  return false;
}

// 위시리스트에서 아이템 삭제
export function deleteWishlist(marketSlug) {
  let wishlist = getWishlistSlugs();
  wishlist = wishlist.filter((slug) => slug !== marketSlug);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

/** 
// 새로운 기능 추가: 마켓 게시물 추가하기
export function addMarket({
  title,
  content,
  crop,
  price,
  location,
  farmName,
  cultivationPeriod,
  hashtags = [], // 기본값을 빈 배열로 설정
  image,
  writer,
}) {
  if (!writer || !writer.id) {
    throw new Error("로그인이 필요합니다.");
  }

  let markets = JSON.parse(localStorage.getItem("markets")) || [];

  const newMarket = {
    id: uuidv4(),
    title,
    content,
    crop,
    price,
    location,
    farmName,
    cultivationPeriod,
    hashtags,
    image,
    writer: {
      id: writer.id,
      name: writer.name,
      profile: { photo: writer.profile?.photo || "default_avatar.svg" },
    },
    createdAt: new Date().toISOString(),
  };
  

  // 중복 확인
  const isDuplicate = markets.some(
    (market) =>
      market.title === newMarket.title && market.content === newMarket.content
  );

  if (isDuplicate) {
    console.warn("중복된 게시물이 발견되었습니다. 추가하지 않습니다.");
    return null;
  }

  markets.unshift(newMarket);
  localStorage.setItem("markets", JSON.stringify(markets));

  return newMarket;
}
  */

// 1. 마켓 게시물 추가 함수 (JWT 인증 없이)
export async function addMarket({
  title,
  content,
  crop,
  price,
  location,
  farmName,
  cultivationPeriod,
  hashtags = [],
  writer_id, // writer_id를 명시적으로 추가
  image, // image는 FormData로 업로드될 가능성
}) {
  try {
    // 1. Market 텍스트 데이터 먼저 전송
    const response = await axios.post(
      `${BASE_URL}/markets/`,
      {
        title,
        content,
        crop,
        price,
        location,
        farm_name: farmName,
        cultivation_period: cultivationPeriod,
        hashtags,
        writer_id, // writer_id 포함
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // 2. Market 생성 성공 후 image 업로드 처리
    const newMarket = response.data;
    if (image) {
      const formData = new FormData();
      formData.append("file", image);

      await uploadMarketImage(newMarket.id, image);
    }

    return newMarket; // 최종 생성된 마켓 데이터 반환
  } catch (error) {
    console.error("마켓 게시물 추가 오류:", error);
    return null;
  }
}

// 2. 마켓 게시물 목록 조회 함수
export async function getMarkets(keyword) {
  try {
    const response = await axios.get(`${BASE_URL}/markets/`, {
      params: { keyword },
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("마켓 게시물 목록 조회 오류:", error);
    return [];
  }
}

// 3. 특정 마켓 게시물 조회 함수
export async function getMarketById(marketId) {
  try {
    const response = await axios.get(`${BASE_URL}/markets/${marketId}`, {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("마켓 게시물 조회 오류:", error);
    return null;
  }
}

// 4. 마켓 게시물 수정 함수
export async function updateMarket(marketId, { title, content }) {
  try {
    const response = await axios.patch(
      `${BASE_URL}/markets/${marketId}`,
      {
        title,
        content,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("마켓 게시물 수정 오류:", error);
    return null;
  }
}

// 5. 마켓 게시물 삭제 함수
// src/api/index.js
export async function deleteMarket(marketId) {
  try {
    const response = await axios.delete(`${BASE_URL}/markets/${marketId}`, {
      headers: {
        accept: "application/json", // 필요한 경우 헤더 설정
      },
    });
    if (response.status === 204) {
      console.log("마켓 게시물 삭제 성공");
      return true; // 성공 시 true 반환
    }
  } catch (error) {
    console.error("마켓 게시물 삭제 오류:", error);
    return false; // 실패 시 false 반환
  }
}

// 6. 마켓 게시물 이미지 업로드 함수
export async function uploadMarketImage(marketId, file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      `${BASE_URL}/markets/${marketId}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("마켓 게시물 이미지 업로드 오류:", error);
    return null;
  }
}

// 7. 마켓 게시물 이미지 조회 함수
export async function fetchMarketImage(marketId) {
  try {
    const response = await axios.get(`${BASE_URL}/markets/${marketId}/image`, {
      headers: {
        accept: "*/*",
      },
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("마켓 이미지 조회 오류:", error);
    return null;
  }
}
