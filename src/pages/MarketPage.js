import { useParams, Navigate, useNavigate } from "react-router-dom";
import { getMarketById, deleteMarket, addWishlist } from "../api";
import styles from "./MarketPage.module.css";
import { useAuth } from "../contexts/AuthProvider";
import { useEffect, useState } from "react";

const BASE_URL = process.env.REACT_APP_BASE_URL;

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
    return <div className={styles.loading}>로딩 중...</div>;
  }

  // 에러 발생 시 처리
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // market 데이터가 없을 때 처리
  if (!market) {
    return <Navigate to="/markets" />;
  }

  // market.hashtags가 undefined일 경우를 대비하여 초기화
  const hashtags = market.hashtags || [];

  const handleDelete = async () => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      await deleteMarket(market.id);
      navigate("/markets");
    }
  };

  const handleAddToWishlist = () => {
    const success = addWishlist(market.slug);
    if (success) {
      alert("데이터가 위시리스트에 추가되었습니다.");
      navigate("/me?tab=wishlist");
    } else {
      alert("이미 위시리스트에 존재하는 데이터입니다.");
    }
  };

  return (
    <div className={styles.marketPage}>
      <h1 className={styles.title}>{market.title}</h1>
      {market.image ? (
        <img
          src={`${BASE_URL}/${market.image}`}
          alt={market.title}
          className={styles.image}
        />
      ) : (
        <div className={styles.noImage}>이미지 없음</div>
      )}
      <p className={styles.content}>{market.content}</p>
      <div className={styles.additionalInfo}>
        <p>농작물: {market.crop || "정보 없음"}</p>
        <p>가격: {market.price ? `${market.price} 씨앗` : "정보 없음"}</p>
        <p>위치: {market.location || "정보 없음"}</p>
        <p>농장 이름: {market.farm_name || "정보 없음"}</p>
        <p>재배 기간: {market.cultivation_period || "정보 없음"}</p>
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
      <div className={styles.buttons}>
        <button
          className={styles.addToWishlistButton}
          onClick={handleAddToWishlist}
        >
          + 데이터 담기
        </button>
        <button className={styles.purchaseButton}>구매하기</button>
      </div>
      {/* market.writer가 존재하는지 확인 후 렌더링 */}
      {user && market.writer && market.writer.id === user.id && (
        <div className={styles.actions}>
          <button onClick={handleDelete} className={styles.deleteButton}>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

export default MarketPage;
