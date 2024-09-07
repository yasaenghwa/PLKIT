import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ListPage from "../components/ListPage";
import Warn from "../components/Warn";
import MarketItem from "../components/MarketItem";
import { getMarkets } from "../api";
import styles from "./MarketListPage.module.css";
import searchBarStyles from "../components/SearchBar.module.css";
import searchIcon from "../assets/search.svg";

function MarketListPage() {
  const [searchParam, setSearchParam] = useSearchParams();
  const initKeyword = searchParam.get("keyword");
  const [keyword, setKeyword] = useState(initKeyword || "");
  const markets = getMarkets(initKeyword);

  const handleKeywordChange = (e) => setKeyword(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParam(keyword ? { keyword } : {});
  };

  return (
    <ListPage
      variant="catalog"
      title="스마트팜 데이터 목록"
      description="안전한 농업 데이터 거래를 경험해보세요."
    >
      <form className={searchBarStyles.form} onSubmit={handleSubmit}>
        <input
          name="keyword"
          value={keyword}
          onChange={handleKeywordChange}
          placeholder="검색으로 데이터 찾기"
        ></input>
        <button type="submit">
          <img src={searchIcon} alt="검색" />
        </button>
      </form>

      <p className={styles.count}>총 {markets.length}개 코스</p>

      {initKeyword && markets.length === 0 ? (
        <Warn
          className={styles.emptyList}
          title="조건에 맞는 데이터가 없어요."
          description="올바른 검색어가 맞는지 다시 한 번 확인해 주세요."
        />
      ) : (
        <div className={styles.marketList}>
          {markets.map((market) => (
            <MarketItem key={market.id} market={market} />
          ))}
        </div>
      )}
    </ListPage>
  );
}

export default MarketListPage;
