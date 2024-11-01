import mock from "./mock.json";
import { v4 as uuidv4 } from "uuid";

import axios from "axios";
import "../axiosConfig"; // axios 설정 파일을 import하여 인터셉터 설정 적용
const BASE_URL = process.env.REACT_APP_BASE_URL; // .env에서 가져온 서버 URL

// 1. 커뮤니티 게시물 이미지 업로드 함수
export async function uploadCommunityImage(communityId, file) {
  console.log("communityId:", communityId); // communityId가 제대로 전달되는지 확인

  if (!communityId) {
    console.error("communityId가 유효하지 않습니다.");
    return null; // communityId가 없을 경우 요청하지 않음
  }

  const formData = new FormData();
  formData.append("file", file); // 선택된 파일을 formData에 추가

  try {
    // community_id에 맞춰 이미지 업로드 요청
    const response = await axios.post(
      `${BASE_URL}/communities/${communityId}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "application/json",
        },
      }
    );
    return response.data; // 서버에서 반환된 파일명 데이터
  } catch (error) {
    console.error("커뮤니티 게시물 이미지 업로드 오류:", error);
    return null;
  }
}

// 2. 커뮤니티 게시물 이미지 조회 함수
export async function fetchCommunityImage(communityId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/communities/${communityId}/image`,
      {
        headers: { accept: "*/*" },
        responseType: "blob", // 이미지 데이터를 binary로 받아오기 위해 responseType을 blob으로 설정
      }
    );
    return URL.createObjectURL(response.data); // Blob 객체를 URL로 변환하여 반환
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("이미지를 찾을 수 없습니다.");
      return null; // 이미지가 없으면 null을 반환
    } else {
      console.error("커뮤니티 게시물 이미지 조회 오류:", error);
      throw error;
    }
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

// 3. 새로운 커뮤니티 게시글 추가 함수 (JSON 형식으로 POST 요청)
export async function addCommunity({ title, content, writer_id }) {
  try {
    const response = await axios.post(
      `${BASE_URL}/communities`,
      {
        title,
        content,
        writer_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );
    console.log("addCommunity - response.data:", response.data); // response.data 확인
    return response.data;
  } catch (error) {
    console.error("커뮤니티 게시글 추가 오류:", error);
    return null;
  }
}

// 4. 커뮤니티 게시글 삭제 (API 요청으로 변경)
export async function deleteCommunity(communityId) {
  try {
    await axios.delete(`${BASE_URL}/communities/${communityId}`);
    return true;
  } catch (error) {
    console.error("커뮤니티 게시글 삭제 오류:", error);
    return false;
  }
}

/** 
function filterByKeyword(items, keyword) {
  const lowered = keyword.toLowerCase();
  return items.filter(({ title }) => title.toLowerCase().includes(lowered));
}

export function getMarkets(keyword) {
  const markets = JSON.parse(localStorage.getItem("markets")) || [];
  if (!keyword) return markets;
  return filterByKeyword(markets, keyword);
}

export function getMarketBySlug(marketSlug) {
  return markets.find((market) => market.slug === marketSlug);
}
*/

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

// 마켓 게시물 ID로 가져오기 함수 추가
export async function getMarketById(marketId) {
  try {
    const response = await axios.get(`${BASE_URL}/markets/${marketId}`, {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("마켓 상세 조회 오류:", error);
    throw error;
  }
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

// 마켓 게시물 추가 API 요청 함수로 수정
export async function addMarket({
  title,
  content,
  crop,
  price,
  location,
  farmName,
  cultivationPeriod,
  hashtags = [],
  image,
  writer,
}) {
  if (!writer || !writer.id) {
    throw new Error("로그인이 필요합니다.");
  }

  // 서버로 보낼 요청 데이터 준비
  const payload = {
    title,
    content,
    crop,
    price,
    location,
    farm_name: farmName,
    cultivation_period: cultivationPeriod,
    hashtags,
    image,
    writer_id: writer.id,
  };

  try {
    // 서버에 POST 요청(markets)
    const response = await axios.post(`${BASE_URL}/markets`, payload);
    return response.data; // 서버에서 받은 응답 데이터 반환
  } catch (error) {
    console.error("마켓 게시물 추가 오류:", error);
    return null;
  }
}

// 마켓 게시물 목록 조회 함수 (검색어 필터링 가능)
export async function getMarkets(keyword) {
  try {
    // 요청 URL과 파라미터 구성
    const response = await axios.get(`${BASE_URL}/markets`, {
      params: { keyword },
      headers: { accept: "application/json" },
    });
    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error("마켓 게시물 목록 조회 오류:", error);
    return []; // 오류 발생 시 빈 배열 반환
  }
}

export function deleteMarket(id) {
  let markets = JSON.parse(localStorage.getItem("markets")) || [];
  markets = markets.filter((market) => market.id !== id);
  localStorage.setItem("markets", JSON.stringify(markets));
}

// 1. 특정 마켓 게시물의 이미지 업로드 함수
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
          accept: "application/json",
        },
      }
    );
    return response.data; // { "filename": "uploaded_image_name.jpg" }
  } catch (error) {
    console.error("마켓 게시물 이미지 업로드 오류:", error);
    return null;
  }
}

// 2. 특정 마켓 게시물의 이미지 조회 함수
export async function fetchMarketImage(marketId) {
  try {
    const response = await axios.get(`${BASE_URL}/markets/${marketId}/image`, {
      headers: { accept: "*/*" },
      responseType: "blob", // 이미지 데이터를 binary로 받아오기 위해 responseType을 blob으로 설정
    });
    return URL.createObjectURL(response.data); // Blob 객체를 URL로 변환하여 반환
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("이미지를 찾을 수 없습니다.");
      return null; // 이미지가 없으면 null을 반환
    } else {
      console.error("마켓 게시물 이미지 조회 오류:", error);
      throw error;
    }
  }
}
