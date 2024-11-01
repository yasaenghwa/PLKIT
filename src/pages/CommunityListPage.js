import { useState, useEffect } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import {
  getCommunitys,
  addCommunity,
  deleteCommunity,
  uploadCommunityImage,
  fetchCommunityImage,
} from "../api";
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
  const { user } = useAuth();

  return (
    <Card className={styles.communityItem} key={community.id}>
      <div className={styles.info}>
        <p className={styles.title}>
          <Link to={`/communities/${community.id}`}>{community.title}</Link>
          {community.answers.length > 0 && (
            <span className={styles.count}>[{community.answers.length}]</span>
          )}
        </p>
        <p className={styles.date}>
          <DateText value={community.created_at} />{" "}
          {/* createdAt을 created_at으로 수정 */}
        </p>
      </div>
      <div className={styles.writer}>
        <Avatar
          src={community.writer?.profile?.photo || "default_avatar.svg"}
          alt={community.writer?.name || "작성자"}
          className={styles.avatar}
        />
      </div>
      <div className={styles.actions}>
        {community.writer_id === user.id && (
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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [communitys, setCommunitys] = useState([]);
  const { user } = useAuth();
  const { communityId } = useParams(); // URL에서 communityId를 동적으로 받아옴

  // 커뮤니티 목록 가져오기
  useEffect(() => {
    async function fetchCommunities() {
      const data = await getCommunitys(keyword);
      setCommunitys(data);
    }
    fetchCommunities();
  }, [keyword]);

  const handleKeywordChange = (e) => setKeyword(e.target.value);
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleContentChange = (e) => setContent(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(keyword ? { keyword } : {});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // 이미지 파일을 선택하면 상태에 저장
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteCommunity(id);
    if (success)
      setCommunitys(communitys.filter((community) => community.id !== id));
  };

  const handleEdit = (community) => {
    setTitle(community.title);
    setContent(community.content);
    setImage(null); // 이미지 미리보기 초기화
  };

  // 새 게시물 작성 핸들러
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 새로운 커뮤니티 게시물 추가
      const newCommunity = await addCommunity({
        title,
        content,
        writer_id: user.id,
      });

      if (newCommunity && newCommunity.id) {
        const communityId = newCommunity.id;
        console.log("새로 등록된 communityId:", communityId);

        setCommunitys((prevCommunitys) => [newCommunity, ...prevCommunitys]);
        alert("게시물이 등록되었습니다.");
        setTitle("");
        setContent("");

        // 이미지가 있는 경우 이미지 업로드 진행
        if (image) {
          const uploadResponse = await uploadCommunityImage(communityId, image);
          if (uploadResponse) {
            console.log("이미지 업로드 성공:", uploadResponse.filename);
          } else {
            console.warn("이미지 업로드 실패");
          }
        } else {
          console.log("이미지 없음"); // 이미지가 없는 경우
        }

        setImage(null); // 업로드 후 이미지 초기화
      } else {
        console.error("유효한 communityId가 없습니다:", newCommunity);
        alert("게시물 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시물 등록 중 오류가 발생했습니다:", error);
      alert("게시물 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
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

      {/* 새 게시물 작성 폼 */}
      <form className={styles.newPostForm} onSubmit={handlePostSubmit}>
        <div className={styles.imageUpload}>
          {image ? (
            <img
              src={URL.createObjectURL(image)}
              alt="미리보기"
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.imagePlaceholder}>이미지 미리보기</div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

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
        <button type="submit" className={styles.submitButton}>
          확인
        </button>
      </form>

      <p className={styles.count}>총 {communitys.length}개 질문</p>

      {/* 게시물 목록 */}
      {keyword && communitys.length === 0 ? (
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
              onDelete={handleDelete}
              onEdit={handleEdit}
              user={user} // 로그인된 사용자 정보 전달
            />
          ))}
        </div>
      )}
    </ListPage>
  );
}

export default CommunityListPage;
