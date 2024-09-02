import Button from "../components/Button";
import Container from "../components/Container";
import Lined from "../components/Lined";
import styles from "./HomePage.module.css";
import landingImg from "../assets/landing.svg";

function HomePage() {
  return (
    <>
      <div className={styles.bg} />
      <Container className={styles.container}>
        <div className={styles.texts}>
          <h1 className={styles.heading}>
            <Lined>스마트팜이 처음이라면,</Lined>
            <br />
            <strong>플키트</strong>
          </h1>
          <p className={styles.description}>
            스마트한 농업의 시작, 당신의 농장을 미래로 연결합니다.
            <br />
            지금 함께 시작해보실래요?
          </p>
          <div>
            <Button>지금 시작하기</Button>
          </div>
        </div>
        <div className={styles.figure}>
          <img src={landingImg} alt="그래프, 모니터, 윈도우, 자물쇠, 키보드" />
        </div>
      </Container>
    </>
  );
}

export default HomePage;
