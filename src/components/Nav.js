import { Link, NavLink, useNavigate } from "react-router-dom";
import Container from "./Container";
//import UserMenu from "./UserMenu";
import logoImg from "../assets/logo.svg";
import styles from "./Nav.module.css";
import { useAuth } from "../contexts/AuthProvider"; // 예시로 useAuth 훅을 사용
import LogButton from "./LogButton";
import Avatar from "./Avatar";

function getLinkStyle({ isActive }) {
  return {
    textDecoration: isActive ? "underline" : "",
  };
}

export function PublicNav() {
  return (
    <header className={styles.Container}>
      <nav className={`${styles.Nav} ${styles.public}`}>
        <Link to="/">
          <img className={styles.Logo} src={logoImg} alt="logo" />
        </Link>
      </nav>
    </header>
  );
}

function Nav() {
  const { user, logout } = useAuth(); // user와 logout 가져오기
  const navigate = useNavigate(); // useNavigate 훅으로 페이지 이동

  // 프로필 아바타를 눌렀을 때 홈으로 이동
  const handleAvatarClick = () => {
    navigate("/"); // "/" 경로로 이동 (HomePage)
  };

  return (
    <div className={styles.nav}>
      <Container className={styles.container}>
        <Link to="/">
          <img src={logoImg} alt="PLKIT Logo" />
        </Link>
        <ul className={styles.menu}>
          <li>
            <NavLink style={getLinkStyle} to="/markets">
              Market
            </NavLink>
          </li>
          <li>
            <NavLink style={getLinkStyle} to="/communitys">
              Community
            </NavLink>
          </li>
          <div className={styles.Menu}>
            {user ? (
              <>
                {user.name}
                {/* 아바타를 클릭하면 홈 페이지로 이동 */}
                <Avatar
                  src={user.avatar}
                  size="small"
                  onClick={handleAvatarClick}
                />
                <div className={styles.Divider} />
                <LogButton as={Link} appearance="secondary" onClick={logout}>
                  로그아웃
                </LogButton>
              </>
            ) : (
              <>
                <LogButton as={Link} appearance="secondary" to="/login">
                  로그인
                </LogButton>
                <LogButton as={Link} to="/register">
                  회원가입
                </LogButton>
              </>
            )}
          </div>
        </ul>
      </Container>
    </div>
  );
}

export default Nav;
