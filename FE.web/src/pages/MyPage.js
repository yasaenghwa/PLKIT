import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../lib/axios";
import Avatar from "../components/Avatar";
import LogButton from "../components/LogButton";
import LogCard from "../components/LogCard";
import Link from "../components/Link";
import HorizontalRule from "../components/HorizontalRule";
import styles from "./MyPage.module.css";
import PlusSquareImage from "../assets/plus-square.svg";
import LinkCard from "../components/LinkCard";
import { useAuth } from "../contexts/AuthProvider";
import WishlistPage from "./WishlistPage"; // WishlistPage 컴포넌트 추가
import "../axiosConfig"; // axios 설정 파일을 import하여 인터셉터 설정 적용

function MyPage() {
  const [links, setLinks] = useState([]);
  const { user, updateMe, getMe } = useAuth(true); // updateMe와 getMe 가져오기
  const navigate = useNavigate();
  const location = useLocation(); // 현재 URL 정보를 가져옵니다.
  const [avatarUrl, setAvatarUrl] = useState(null); // 아바타 이미지 URL 상태 추가

  // 쿼리 파라미터에서 탭 정보를 가져옵니다.
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  console.log("최신 사용자 정보:", user); // 확인용 콘솔 로그 추가

  // 아바타 이미지를 가져오는 함수
  async function fetchAvatar() {
    try {
      const res = await axios.get("/users/me/avatar", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        responseType: "blob", // 이미지 데이터가 Blob으로 반환될 수 있도록 설정
      });
      const imageUrl = URL.createObjectURL(res.data); // Blob을 URL로 변환
      setAvatarUrl(imageUrl); // 상태에 저장
    } catch (error) {
      console.error("아바타 이미지 가져오기 오류:", error);
    }
  }

  // 페이지가 로드될 때 아바타 이미지 불러오기
  useEffect(() => {
    fetchAvatar();
  }, []);

  // 탭 변경 시 URL 쿼리 파라미터 업데이트
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/me?tab=${tab}`);
  };

  async function getMyLinks() {
    try {
      const res = await axios.get("/users/me/links");
      const nextLinks = res.data;
      setLinks(nextLinks);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("404 에러 무시: 요청한 리소스를 찾을 수 없습니다.");
        return null; // 404 에러 무시하고 null 반환
      } else {
        throw error; // 다른 에러는 그대로 throw하여 화면에 표시
      }
    }
  }

  function handleEditClick(linkId) {
    navigate(`/me/links/${linkId}/edit`);
  }

  function handleDeleteClick(linkId) {
    try {
      axios.delete(`/users/me/links/${linkId}`);
      setLinks((prevLinks) => prevLinks.filter((link) => link.id !== linkId));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("404 에러 무시: 요청한 리소스를 찾을 수 없습니다.");
        return null; // 404 에러 무시하고 null 반환
      } else {
        throw error; // 다른 에러는 그대로 throw하여 화면에 표시
      }
    }
  }

  useEffect(() => {
    getMyLinks();
  }, []);

  if (!user) {
    return null;
  }

  async function handleProfileUpdate(newProfileData) {
    await updateMe(newProfileData);
    await getMe(); // 프로필 업데이트 후 최신 정보 불러오기
  }

  return (
    <>
      <header className={styles.Header}>
        <LogCard className={styles.Profile}>
          <Avatar src={avatarUrl} alt="프로필 이미지" />

          <div className={styles.Values}>
            <div className={styles.Name}>{user.name}</div>
            <div className={styles.Email}>{user.email}</div>
          </div>
          <LogButton className={styles.EditLogButton} as={Link} to="/me/edit">
            편집
          </LogButton>
        </LogCard>
        <p className={styles.Bio}>
          {user.bio ??
            "아래에 등록한 사이트들과 자신에 대해 간단하게 소개하는 설명을 작성해 주세요!"}
        </p>
      </header>
      {/* 탭 선택 UI */}
      <div className={styles.Tabs}>
        <button
          className={activeTab === "profile" ? styles.active : ""}
          onClick={() => handleTabChange("profile")}
        >
          링크 북마크
        </button>
        <button
          className={activeTab === "wishlist" ? styles.active : ""}
          onClick={() => handleTabChange("wishlist")}
        >
          위시리스트
        </button>
      </div>
      <HorizontalRule className={styles.HorizontalRule} />
      {/* 선택된 탭에 따라 다른 콘텐츠 표시 */}
      {activeTab === "profile" && (
        <ul className={styles.LinkList}>
          {links.map((link) => (
            <li className={styles.LinkItem} key={link.id}>
              <LinkCard
                title={link.title}
                url={link.url}
                thumbUrl={link.thumbUrl}
                onClick={() => handleEditClick(link.id)}
                onDelete={() => handleDeleteClick(link.id)}
              />
            </li>
          ))}
          <li>
            <Link className={styles.CreateLink} to="/me/links/create">
              <img src={PlusSquareImage} alt="더하기 아이콘" />
              링크 추가하기
            </Link>
          </li>
        </ul>
      )}
      {activeTab === "wishlist" && <WishlistPage />}
    </>
  );
}

export default MyPage;
