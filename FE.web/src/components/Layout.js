import { Outlet, useNavigate } from "react-router-dom";
import Nav, { PublicNav } from "./Nav"; // Nav는 기본 내보내기, PublicNav는 명시적 내보내기
import styles from "./Layout.module.css";
import leftArrowImage from "../assets/left-arrow.svg";

//상단에 Nav 컴포넌트가 포함되고, 메인 콘텐츠 영역은 Outlet으로 표시
export function LandingLayout() {
  return (
    <div className={styles.Layout}>
      <Nav />
      <main className={`${styles.Main} ${styles.landing}`}>
        <Outlet />
      </main>
    </div>
  );
}

//MyPageLayout은 마이페이지 같은 개인화된 페이지
export function MyPageLayout() {
  return (
    <div className={`${styles.Layout} ${styles.dark}`}>
      <main className={styles.Main}>
        <div className={styles.Container}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

//로그인 페이지 또는 사용자와 관련된 공개 페이지에서 사용
export function UserLayout() {
  return (
    <div className={`${styles.Layout} ${styles.dark}`}>
      <PublicNav />
      <main className={styles.Main}>
        <div className={styles.Container}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

//주로 전체 화면을 차지하는 페이지에서 사용되며, 뒤로 가기 버튼을 포함
export function FullLayout() {
  const navigate = useNavigate();

  function handleClickBack() {
    navigate(-1);
  }

  return (
    <main className={`${styles.FullLayout}`}>
      <div className={styles.Container}>
        <div className={styles.BackLinkContainer}>
          <img
            className={styles.BackLink}
            src={leftArrowImage}
            alt="뒤로가기"
            onClick={handleClickBack}
          />
        </div>
        <Outlet />
      </div>
    </main>
  );
}
