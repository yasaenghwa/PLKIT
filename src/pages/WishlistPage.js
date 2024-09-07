import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteWishlist, getWishlist } from "../api";
import Button from "../components/Button";
import Container from "../components/Container";
import MarketItem from "../components/MarketItem";
import Warn from "../components/Warn";
import closeButton from "../assets/closeButton.svg";
import styles from "./WishlistPage.module.css";

function WishlistPage() {
  const [markets, setMarkets] = useState([]);

  const handleDelete = (marketSlug) => {
    deleteWishlist(marketSlug);
    const nextMarkets = getWishlist();
    setMarkets(nextMarkets);
  };

  useEffect(() => {
    const nextMarkets = getWishlist();
    setMarkets(nextMarkets);
  }, []);

  return (
    <Container className={styles.container}>
      <h1 className={styles.title}>나의 위시리스트</h1>
      {markets.length === 0 ? (
        <>
          <Warn
            className={styles.emptyList}
            title="담아 놓은 코스가 없어요."
            description="카탈로그에서 나에게 필요한 코스를 찾아보세요."
          />
          <div className={styles.link}>
            <Link to="/markets">
              <Button as="div">코스 찾아보기</Button>
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
