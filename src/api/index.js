import mock from "./mock.json";
import { v4 as uuidv4 } from "uuid";
const { markets, communitys } = mock;

function filterByKeyword(items, keyword) {
  const lowered = keyword.toLowerCase();
  return items.filter(({ title }) => title.toLowerCase().includes(lowered));
}

export function getMarkets(keyword) {
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
  return communitys.find((community) => community.id === communityId);
}

// 새로운 기능 추가: 게시글 추가하기
export function addCommunity(title, content, user) {
  // user 객체 로그 확인
  console.log("addCommunity - user:", user);

  // 현재 로그인한 사용자 정보 가져오기

  if (!user) {
    throw new Error("로그인이 필요합니다."); // 로그인이 되어 있지 않으면 오류 발생
  }

  // 새로운 게시글 객체 생성
  const newCommunity = {
    id: uuidv4(), // UUID를 사용해 고유한 ID 생성 // generateUniqueId(user), // 고유한 ID 생성    title,
    title,
    content,
    writer: {
      name: user.name, // 로그인한 사용자의 이름 사용
      profile: { photo: user.avatar || "profile.jpg" }, // 프로필 사진 확인
    },
    createdAt: new Date(),
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
    return; // 중복된 게시글이 있으면 추가하지 않음
  }

  // 기존 communitys에 새로운 게시글 추가
  communitys.unshift(newCommunity);

  // 업데이트된 communitys를 로컬 스토리지에 저장
  localStorage.setItem("communitys", JSON.stringify(communitys));

  // 새로운 게시글 반환 (필요에 따라)
  return newCommunity;
}

const WISHLIST_KEY = "codethat-wishlist";
const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "{}");

export function addWishlist(marketSlug) {
  wishlist[marketSlug] = true;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

export function deleteWishlist(marketSlug) {
  delete wishlist[marketSlug];
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

export function getWishlist() {
  return markets.filter((market) => wishlist[market.slug]);
}
