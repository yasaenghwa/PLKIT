import { Link } from "react-router-dom";
import Card from "./Card";
import MarketIcon from "./MarketIcon";
import Tags from "./Tags";
import getMarketColor from "../utils/getMarketColor";
import styles from "./MarketItem.module.css";

const DIFFICULTY = ["입문", "초급", "중급", "고급"];

function MarketItem({ market }) {
  const showSummary = market.summary && market.title !== market.summary;
  const marketColor = getMarketColor(market.code);
  const difficulty = DIFFICULTY[market.difficulty || 0];
  const thumbStyle = {
    borderColor: marketColor,
  };

  return (
    <Card className={styles.marketItem}>
      <div className={styles.thumb} style={thumbStyle}>
        <MarketIcon photoUrl={market.photoUrl} />
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>
          <Link to={`/markets/${market.slug}`}>{market.title}</Link>
        </h2>
        <p className={styles.description}>{showSummary && market.summary}</p>
        <div>
          <Tags values={[market.language, difficulty]} />
        </div>
      </div>
    </Card>
  );
}

export default MarketItem;
