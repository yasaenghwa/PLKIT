// src/pages/MarketPage.js

import { useParams, Navigate, useNavigate } from "react-router-dom";
import { getMarketById, deleteMarket, addWishlist } from "../api";
import styles from "./MarketPage.module.css";
import { useAuth } from "../contexts/AuthProvider";
import { useEffect, useState } from "react";

function MarketPage() {
  const { marketId } = useParams();
  const [market, setMarket] = useState(null); // 마켓 데이터 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const navigate = useNavigate();
  const { user } = useAuth();

  // API로부터 마켓 데이터를 가져오는 함수
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const marketData = await getMarketById(marketId);
        setMarket(marketData);
      } catch (err) {
        console.error("마켓 상세 정보 로드 중 오류:", err);
        setError("마켓 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, [marketId]);

  // 로딩 중일 때 표시
  if (loading) {
    return <div>Loading...</div>;
  }

  // market 데이터가 없을 때 처리
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

  // 데이터 담기 핸들러 함수 추가
  const handleAddToWishlist = () => {
    addWishlist(market.slug); // 현재 마켓 아이템을 위시리스트에 추가
    alert("데이터가 위시리스트에 추가되었습니다.");
    navigate("/me?tab=wishlist");

    const success = addWishlist(market.slug);
    if (success) {
      alert("데이터가 위시리스트에 추가되었습니다.");
    } else {
      alert("이미 위시리스트에 존재하는 데이터입니다.");
    }
    navigate("/me?tab=wishlist");
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
        <p>농장 이름: {market.farm_name}</p>
        <p>재배 기간: {market.cultivation_period}</p>
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
      {/* 구매 및 데이터 담기 버튼 */}
      <div className={styles.buttons}>
        <button
          className={styles.addToCourseButton}
          onClick={handleAddToWishlist} // 클릭 이벤트 추가
        >
          + 데이터 담기
        </button>
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
