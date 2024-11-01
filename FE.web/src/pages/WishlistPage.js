// src/pages/WishlistPage.js

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteWishlist, getWishlistSlugs } from "../api";
import Button from "../components/Button";
import Container from "../components/Container";
import MarketItem from "../components/MarketItem";
import Warn from "../components/Warn";
import closeButton from "../assets/closeButton.svg";
import styles from "./WishlistPage.module.css";

function WishlistPage() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // 위시리스트에 있는 마켓 데이터를 가져오는 함수
  const fetchWishlistMarkets = async () => {
    // 위시리스트에 저장된 슬러그 가져오기
    const wishlistSlugs = getWishlistSlugs();

    // 슬러그를 이용해 마켓 데이터 가져오기 (API 호출 등)
    const wishlistMarkets = await Promise.all(
      wishlistSlugs.map(async (slug) => {
        // API 호출로 마켓 데이터 가져오기
        const response = await fetch(`/api/markets/${slug}`);
        return response.json();
      })
    );

    setMarkets(wishlistMarkets);
    setLoading(false);
  };

  // 아이템 삭제 핸들러
  const handleDelete = (marketSlug) => {
    deleteWishlist(marketSlug);
    setMarkets((prevMarkets) =>
      prevMarkets.filter((market) => market.slug !== marketSlug)
    );
  };

  useEffect(() => {
    fetchWishlistMarkets();
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Container className={styles.container}>
      <h1 className={styles.title}>나의 위시리스트</h1>
      {markets.length === 0 ? (
        <>
          <Warn
            className={styles.emptyList}
            title="담아 놓은 데이터가 없어요."
            description="Market에서 나에게 필요한 데이터를 찾아보세요."
          />
          <div className={styles.link}>
            <Link to="/markets">
              <Button as="div">데이터 찾아보기</Button>
            </Link>
          </div>
        </>
      ) : (
        <ul className={styles.items}>
          {markets.map((market) => (
            <li key={market.slug} className={styles.item}>
              <MarketItem market={market} />
              <img
                className={styles.delete}
                src={closeButton}
                alt="닫기"
                onClick={() => handleDelete(market.slug)}
              />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

export default WishlistPage;
