import mock from "./mock.json";
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
