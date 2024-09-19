import { useState, useEffect } from "react"; // useEffect 임포트 추가
import { Link, useSearchParams } from "react-router-dom";
import { getCommunitys, addCommunity } from "../api";
import { useAuth } from "../contexts/AuthProvider";
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
          src={community.writer.profile.photo} // prop 이름을 'src'로 변경
          alt={community.writer.name} // alt 속성 추가
          className={styles.avatar} // 필요한 추가 클래스명 전달
        />
      </div>
    </Card>
  );
}

function CommunityListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initKeyword = searchParams.get("keyword");
  const [keyword, setKeyword] = useState(initKeyword || "");
  const [title, setTitle] = useState(""); // 새 게시글 제목 상태
  const [content, setContent] = useState(""); // 새 게시글 내용 상태
  const [communitys, setCommunitys] = useState([]); // 초기 상태를 빈 배열로 설정
  // const [communitys, setCommunitys] = useState(getCommunitys(initKeyword)); // 상태를 사용해 게시글 관리

  const { user } = useAuth(); // 로그인한 사용자 정보를 가져옵니다.

  useEffect(() => {
    // 검색어(initKeyword)가 변경될 때마다 커뮤니티 게시글을 필터링하여 상태 업데이트
    const filteredCommunitys = getCommunitys(initKeyword); // initKeyword를 기준으로 게시글을 가져옴
    setCommunitys(filteredCommunitys); // 상태 업데이트
  }, [initKeyword]); // initKeyword가 변경될 때마다 실행

  /*
  useEffect(() => {
    // 로컬 스토리지에서 커뮤니티 게시글을 불러와 상태 업데이트
    const storedCommunitys =
      JSON.parse(localStorage.getItem("communitys")) || [];
    setCommunitys(storedCommunitys);
  }, []);
  */

  const handleKeywordChange = (e) => setKeyword(e.target.value);
  const handleTitleChange = (e) => setTitle(e.target.value); // 제목 변경 처리
  const handleContentChange = (e) => setContent(e.target.value); // 내용 변경 처리

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(keyword ? { keyword } : {});
  };

  // 새 게시글 폼 제출 처리
  const handlePostSubmit = (e) => {
    e.preventDefault();
    console.log("게시물 등록 시도"); // 함수 호출 확인 로그

    if (!user) {
      alert("게시글을 작성하려면 로그인이 필요합니다.");
      return;
    }

    // 로그 추가: 중복 호출 확인
    console.log("handlePostSubmit 호출");

    try {
      const newCommunity = addCommunity(title, content, user); // 새로운 게시글 추가
      setCommunitys([newCommunity, ...communitys]); // 새 게시글을 리스트에 추가
      setTitle(""); // 제목 초기화
      setContent(""); // 내용 초기화
    } catch (error) {
      console.error("게시글 작성 중 오류가 발생했습니다:", error);
      alert("게시글 작성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
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
          onChange={handleKeywordChange}
          placeholder="검색으로 게시글 찾기"
        />
        <button type="submit">
          <img src={searchIcon} alt="검색" />
        </button>
      </form>

      {/* 새 게시글 작성 폼 */}
      <form className={styles.newPostForm} onSubmit={handlePostSubmit}>
        <input
          name="title"
          value={title}
          placeholder="제목"
          onChange={handleTitleChange}
        />
        <textarea
          name="content"
          value={content}
          placeholder="내용"
          onChange={handleContentChange}
        />
        <button type="submit">게시글 등록</button>
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
