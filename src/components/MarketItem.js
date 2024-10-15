// src/components/MarketItem.js

import { Link } from "react-router-dom";
import Card from "./Card";
import styles from "./MarketItem.module.css";
import { useAuth } from "../contexts/AuthProvider";

function MarketItem({ market, onDelete, onEdit }) {
  const { user } = useAuth();

  return (
    <Card className={styles.marketItem}>
      <div className={styles.thumb}>
        {market.image ? (
          <img src={market.image} alt="이미지" className={styles.image} />
        ) : (
          <div className={styles.noImage}>이미지 없음</div>
        )}
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>
          <Link to={`/markets/${market.id}`}>{market.title}</Link>
        </h2>
        <p className={styles.description}>{market.content}</p>
        <div className={styles.additionalInfo}>
          <span className={styles.crop}>농작물: {market.crop}</span>
          <span className={styles.price}>가격: {market.price} 씨앗</span>
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
        market.writer &&
        market.writer.id &&
        user.id &&
        market.writer.id === user.id && (
          <div className={styles.actions}>
            <button onClick={() => onEdit(market)}>수정</button>
            <button onClick={() => onDelete(market.id)}>삭제</button>
          </div>
        )}
    </Card>
  );
}

export default MarketItem;
