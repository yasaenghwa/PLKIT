import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function MyPage() {
  const { user } = useAuth(true); //이 코드에서 useAuth(true)는 사용자가 로그인된 상태인지 확인하고, 로그인이 되어 있지 않으면 로그인 페이지로 리디렉션하는 기능을 제공
  const [links, setLinks] = useState([]);
  const navigate = useNavigate();

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
      <HorizontalRule className={styles.HorizontalRule} />
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
    </>
  );
}

export default MyPage;
