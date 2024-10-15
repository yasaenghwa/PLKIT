// src/pages/MarketPage.js

import { useParams, Navigate, useNavigate } from "react-router-dom";
import { getMarketById, deleteMarket } from "../api";
import styles from "./MarketPage.module.css";
import { useAuth } from "../contexts/AuthProvider";

function MarketPage() {
  const { marketId } = useParams();
  const market = getMarketById(marketId);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!market) {
    return <Navigate to="/markets" />;
  }

  // market.hashtags가 undefined일 경우를 대비하여 초기화
  const hashtags = market.hashtags || [];

  const handleDelete = () => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      deleteMarket(market.id);
      navigate("/markets");
    }
  };

  return (
    <div className={styles.marketPage}>
      <h1 className={styles.title}>{market.title}</h1>
      {market.image && (
        <img src={market.image} alt="이미지" className={styles.image} />
      )}
      <p className={styles.content}>{market.content}</p>
      <div className={styles.additionalInfo}>
        <p>농작물: {market.crop}</p>
        <p>가격: {market.price} 씨앗</p>
        <p>위치: {market.location}</p>
        <p>농장 이름: {market.farmName}</p>
        <p>재배 기간: {market.cultivationPeriod}</p>
        {hashtags.length > 0 && (
          <div className={styles.hashtags}>
            {hashtags.map((tag, index) => (
              <span key={index} className={styles.hashtag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* 구매 및 코스 담기 버튼 */}
      <div className={styles.buttons}>
        <button className={styles.addToCourseButton}>+ 코스 담기</button>
        <button className={styles.purchaseButton}>구매하기</button>
      </div>
      {/* 수정 및 삭제 버튼 */}
      {user && market.writer.id === user.id && (
        <div className={styles.actions}>
          {/* 수정 기능은 추가 구현 필요 */}
          {/* <button onClick={() => navigate(`/markets/${market.id}/edit`)}>수정</button> */}
          <button onClick={handleDelete}>삭제</button>
        </div>
      )}
    </div>
  );
}

export default MarketPage;
