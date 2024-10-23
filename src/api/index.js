import mock from "./mock.json";
import { v4 as uuidv4 } from "uuid";
const { markets, communitys } = mock;

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

export function getCommunitys(keyword) {
  if (!keyword) return communitys;
  return filterByKeyword(communitys, keyword);
}

export function getCommunityById(communityId) {
  const communitys = JSON.parse(localStorage.getItem("communitys")) || [];
  return communitys.find((community) => community.id === communityId);
}

// 새로운 기능 추가: 게시글 추가하기
export function addCommunity({ title, content, image, writer }) {
  // writer 객체 로그 확인
  console.log("addCommunity - writer:", writer);

  // writer 객체에서 user 정보 확인
  if (!writer || !writer.id) {
    throw new Error("로그인이 필요합니다."); // 로그인이 되어 있지 않으면 오류 발생
  }

  // 기존 communitys 데이터를 가져옴 (로컬 스토리지 또는 초기화)
  let communitys = JSON.parse(localStorage.getItem("communitys")) || [];

  // 로그 추가: 이미지 URL 확인
  console.log("addCommunity - 이미지 URL:", image);

  // 새로운 게시글 객체 생성
  const newCommunity = {
    id: uuidv4(), // UUID를 사용해 고유한 ID 생성
    title,
    content,
    image, // 이미지 URL 추가
    writer: {
      id: writer.id, // 작성자의 ID
      name: writer.name, // 작성자의 이름
      profile: { photo: writer.profile?.photo || "default_avatar.svg" }, // 프로필 사진 확인
    },
    createdAt: new Date().toISOString(),
    answers: [],
  };

  // communitys 배열 업데이트 로그
  console.log("Adding new community:", newCommunity);

  // 중복된 게시글이 있는지 확인 (ID뿐만 아니라 제목과 내용도 비교)
  const isDuplicate = communitys.some(
    (community) =>
      community.title === newCommunity.title &&
      community.content === newCommunity.content
  );

  if (isDuplicate) {
    console.warn("중복된 게시글이 발견되었습니다. 추가하지 않습니다.");
    return null; // 중복된 게시글이 있으면 추가하지 않음
  }

  // 기존 communitys에 새로운 게시글 추가
  communitys.unshift(newCommunity);

  // 저장된 데이터를 확인하는 로그 추가
  console.log("저장된 게시글들:", communitys);

  // 업데이트된 communitys를 로컬 스토리지에 저장
  localStorage.setItem("communitys", JSON.stringify(communitys));

  // 새로운 게시글 반환
  return newCommunity;
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

// 마켓 게시물 ID로 가져오기 함수 추가
export function getMarketById(marketId) {
  const markets = JSON.parse(localStorage.getItem("markets")) || [];
  return markets.find((market) => market.id === marketId);
}

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

export function deleteMarket(id) {
  let markets = JSON.parse(localStorage.getItem("markets")) || [];
  markets = markets.filter((market) => market.id !== id);
  localStorage.setItem("markets", JSON.stringify(markets));
}
