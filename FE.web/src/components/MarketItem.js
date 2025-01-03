import { Link } from "react-router-dom";
import Card from "./Card";
import styles from "./MarketItem.module.css";
import { useAuth } from "../contexts/AuthProvider";

const BASE_URL = process.env.REACT_APP_BASE_URL; // .env에서 가져온 서버 URL

function MarketItem({ market, onDelete, onEdit }) {
  const { user } = useAuth();
  console.log("market 데이터:", market); // 데이터 내용 확인

  return (
    <Card className={styles.marketItem}>
      <div className={styles.thumb}>
        {market.image ? (
          <img
            src={`${BASE_URL}/markets/${market.id}/image`}
            alt={`${market.title} 이미지`}
            className={styles.image}
          />
        ) : (
          <div className={styles.noImage}>이미지 없음</div>
        )}
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>
          <Link to={`/markets/${market.id}`}>
            {market.title || "제목 없음"}
          </Link>
        </h2>
        <p className={styles.description}>{market.content || "설명 없음"}</p>
        <div className={styles.additionalInfo}>
          <span className={styles.crop}>
            농작물: {market.crop || "정보 없음"}
          </span>
          <span className={styles.price}>
            가격: {market.price ? `${market.price} 씨앗` : "정보 없음"}
          </span>
        </div>
        {/* 해시태그가 존재할 때만 렌더링 */}
        {market.hashtags && market.hashtags.length > 0 && (
          <div className={styles.hashtags}>
            {market.hashtags.map((tag, index) => (
              <span key={index} className={styles.hashtag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* 수정 및 삭제 버튼 */}
      {user &&
        market.writer_id === user.id && ( // writer_id와 로그인 사용자 id 비교
          <div className={styles.actions}>
            <button
              onClick={() => onEdit && onEdit(market)}
              className={styles.editButton}
            >
              수정
            </button>
            <button
              onClick={() => onDelete && onDelete(market.id)}
              className={styles.deleteButton}
            >
              삭제
            </button>
          </div>
        )}
    </Card>
  );
}

export default MarketItem;
