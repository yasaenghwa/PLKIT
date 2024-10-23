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

function MyPage() {
  const { user } = useAuth(true);
  const [links, setLinks] = useState([]);
  const navigate = useNavigate();
  const location = useLocation(); // 현재 URL 정보를 가져옵니다.

  // 쿼리 파라미터에서 탭 정보를 가져옵니다.
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  // 탭 변경 시 URL 쿼리 파라미터 업데이트
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/me?tab=${tab}`);
  };

  async function getMyLinks() {
    const res = await axios.get("/users/me/links");
    const nextLinks = res.data;
    setLinks(nextLinks);
  }

  function handleEditClick(linkId) {
    navigate(`/me/links/${linkId}/edit`);
  }

  function handleDeleteClick(linkId) {
    axios.delete(`/users/me/links/${linkId}`);
    setLinks((prevLinks) => prevLinks.filter((link) => link.id !== linkId));
  }

  useEffect(() => {
    getMyLinks();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <>
      <header className={styles.Header}>
        <LogCard className={styles.Profile}>
          <Avatar src={user.avatar} alt="프로필 이미지" />

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
