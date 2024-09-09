import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCommunitys } from "../api";
import DateText from "../components/DateText";
import ListPage from "../components/ListPage";
import Warn from "../components/Warn";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import styles from "./CommunityListPage.module.css";
import searchBarStyles from "../components/SearchBar.module.css";
import searchIcon from "../assets/search.svg";

function CommunityItem({ community }) {
  return (
    <Card className={styles.communityItem} key={community.title}>
      <div className={styles.info}>
        <p className={styles.title}>
          <Link to={`/communitys/${community.id}`}>{community.title}</Link>
          {community.answers.length > 0 && (
            <span className={styles.count}>[{community.answers.length}]</span>
          )}
        </p>
        <p className={styles.date}>
          <DateText value={community.createdAt} />
        </p>
      </div>
      <div className={styles.writer}>
        <Avatar
          photo={community.writer.profile.photo}
          name={community.writer.name}
        />
      </div>
    </Card>
  );
}

function CommunityListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initKeyword = searchParams.get("keyword");
  const [keyword, setKeyword] = useState(initKeyword || "");
  const communitys = getCommunitys(initKeyword);

  const handleKeywordChange = (e) => setKeyword(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(keyword ? { keyword } : {});
  };

  return (
    <ListPage
      variant="community"
      title="커뮤니티"
      description="농업 지식을 공유하고 소통해보세요."
    >
      <form className={searchBarStyles.form} onSubmit={handleSubmit}>
        <input
          name="keyword"
          value={keyword}
          placeholder="검색으로 게시글 찾기"
          onChange={handleKeywordChange}
        />
        <button type="submit">
          <img src={searchIcon} alt="검색" />
        </button>
      </form>

      <p className={styles.count}>총 {communitys.length}개 질문</p>

      {initKeyword && communitys.length === 0 ? (
        <Warn
          className={styles.emptyList}
          title="조건에 맞는 질문이 없어요."
          description="올바른 검색어가 맞는지 다시 한 번 확인해 주세요."
        />
      ) : (
        <div className={styles.communityList}>
          {communitys.map((community) => (
            <CommunityItem key={community.id} community={community} />
          ))}
        </div>
      )}
    </ListPage>
  );
}

export default CommunityListPage;
