import Button from "../components/Button";
import { Navigate, useParams } from "react-router-dom";
import { addWishlist, getMarketBySlug } from "../api";
import Container from "../components/Container";
import Card from "../components/Card";
import MarketIcon from "../components/MarketIcon";
import getMarketColor from "../utils/getMarketColor";
import styles from "./MarketPage.module.css";
import { useNavigate } from "react-router-dom";

function MarketPage() {
  const navigate = useNavigate();
  const { marketSlug } = useParams();
  const market = getMarketBySlug(marketSlug);
  const marketColor = getMarketColor(market?.code);

  if (!market) {
    return <Navigate to="/markets" />;
  }

  const headerStyle = {
    borderTopColor: marketColor,
  };

  const handleAddWishlistClick = () => {
    addWishlist(market?.slug);
    navigate("/wishlist");
  };

  return (
    <>
      <div className={styles.header} style={headerStyle}>
        <Container className={styles.content}>
          <MarketIcon photoUrl={market.photoUrl} />
          <h1 className={styles.title}>{market.title}</h1>
          <Button variant="round" onClick={handleAddWishlistClick}>
            + 코스 담기
          </Button>
          <p className={styles.summary}>{market.summary}</p>
        </Container>
      </div>
      <Container className={styles.topics}>
        {market.topics.map(({ topic }) => (
          <Card className={styles.topic} key={topic.slug}>
            <h3 className={styles.title}>{topic.title}</h3>
            <p className={styles.summary}>{topic.summary}</p>
          </Card>
        ))}
      </Container>
    </>
  );
}

export default MarketPage;
