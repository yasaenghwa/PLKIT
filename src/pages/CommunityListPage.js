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

function CommunityItem({ community, onDelete, onEdit }) {
  const { user } = useAuth(); // 로그인한 사용자 정보를 가져옵니다.

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
          src={community.writer.profile.photo || "default_avatar.svg"} // 기본 이미지 설정
          alt={community.writer.name}
          className={styles.avatar}
        />
      </div>
      <div className={styles.actions}>
        {user &&
          community.writer.name === user.name && ( // ID가 일치할 때만 버튼 표시
            <>
              <button onClick={() => onEdit(community)}>수정</button>
              <button onClick={() => onDelete(community.id)}>삭제</button>
            </>
          )}
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
  const [image, setImage] = useState(null); // 이미지 상태
  const [communitys, setCommunitys] = useState([]); // 초기 상태를 빈 배열로 설정

  const { user } = useAuth(); // 로그인한 사용자 정보를 가져옵니다.

  // 검색어가 변경될 때마다 커뮤니티 게시글을 필터링하여 상태 업데이트
  useEffect(() => {
    const storedCommunitys =
      JSON.parse(localStorage.getItem("communitys")) || [];
    const filteredCommunitys = initKeyword
      ? storedCommunitys.filter((community) =>
          community.title.toLowerCase().includes(initKeyword.toLowerCase())
        )
      : storedCommunitys;
    setCommunitys(filteredCommunitys);
  }, [initKeyword]);

  // 로컬 스토리지에서 중복된 게시글을 제거하고 상태 업데이트
  useEffect(() => {
    const storedCommunitys =
      JSON.parse(localStorage.getItem("communitys")) || [];
    const uniqueCommunitys = Array.from(
      new Set(storedCommunitys.map((item) => item.id))
    ) // 중복된 게시글 ID 제거
      .map((id) => storedCommunitys.find((item) => item.id === id));
    setCommunitys(uniqueCommunitys);
  }, []);

  const handleKeywordChange = (e) => setKeyword(e.target.value);
  const handleTitleChange = (e) => setTitle(e.target.value); // 제목 변경 처리
  const handleContentChange = (e) => setContent(e.target.value); // 내용 변경 처리
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // 이미지 URL을 설정
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(keyword ? { keyword } : {});
    // 게시물 등록 로직 추가
    console.log("제목:", title);
    console.log("내용:", content);
    console.log("이미지:", image);
  };

  const handleDelete = (id) => {
    const updatedCommunitys = communitys.filter(
      (community) => community.id !== id
    );
    setCommunitys(updatedCommunitys);
    localStorage.setItem("communitys", JSON.stringify(updatedCommunitys));
  };

  const handleEdit = (community) => {
    setTitle(community.title);
    setContent(community.content);
    setImage(community.image);
    // 수정 모드 활성화를 위한 로직 추가 (추가 구현 가능)
  };

  // 새 게시글 폼 제출 처리
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    console.log("게시물 등록 시도"); // 함수 호출 확인 로그

    if (!user) {
      alert("게시글을 작성하려면 로그인이 필요합니다.");
      return;
    }

    // 제목과 내용을 입력하지 않았을 경우 처리
    if (!title || !content) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    try {
      // addCommunity 함수 호출하여 새 게시글 추가
      const newCommunity = await addCommunity({
        title,
        content,
        image,
        writer: {
          id: user.id, // 사용자 ID
          name: user.name, // 사용자 이름
          profile: {
            photo: user.avatar || "default_avatar.svg", // user.avatar로 변경하여 전달
          },
        },
      });

      // addCommunity 함수가 성공적으로 새로운 게시글을 반환했을 때만 상태 업데이트
      if (newCommunity) {
        setCommunitys((prevCommunitys) => [newCommunity, ...prevCommunitys]); // 새 게시글을 기존 목록에 추가
        setTitle(""); // 제목 초기화
        setContent(""); // 내용 초기화
        setImage(null); // 이미지 초기화
      } else {
        console.warn("중복된 게시글이 발견되어 추가되지 않았습니다.");
      }
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
        {/* 이미지 업로드 섹션 */}
        <div className={styles.imageUpload}>
          {image ? (
            <img src={image} alt="미리보기" className={styles.previewImage} />
          ) : (
            <div className={styles.imagePlaceholder}>이미지 미리보기</div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* 입력 필드를 수직으로 배치 */}
        <div className={styles.inputContainer}>
          <input
            type="text"
            name="title"
            value={title}
            placeholder="제목을 입력해주세요."
            onChange={handleTitleChange}
            className={styles.inputField}
          />
          <textarea
            name="content"
            value={content}
            placeholder="내용을 작성해주세요."
            onChange={handleContentChange}
            className={styles.inputField}
          />
        </div>
        {/* 게시물 등록 버튼 */}
        <button type="submit" className={styles.submitButton}>
          확인
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
            <CommunityItem
              key={community.id}
              community={community}
              onDelete={handleDelete} // onDelete 핸들러 전달
              onEdit={handleEdit} // onEdit 핸들러 전달
            />
          ))}
        </div>
      )}
    </ListPage>
  );
}

export default CommunityListPage;
