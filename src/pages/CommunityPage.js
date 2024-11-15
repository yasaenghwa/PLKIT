import classNames from "classnames";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getCommunityById, fetchCommunityImage } from "../api";
import Avatar from "../components/Avatar";
import Card from "../components/Card";
import Container from "../components/Container";
import DateText from "../components/DateText";
import Lined from "../components/Lined";
import Warn from "../components/Warn";
import styles from "./CommunityPage.module.css";
import { useAuth } from "../contexts/AuthProvider"; // AuthProvider에서 user 가져오기

// CommunityPage.js에서 기본 이미지 설정

function CommunityPage() {
  const { communityId } = useParams();
  const [imageUrl, setImageUrl] = useState(null);
  const [communityData, setCommunityData] = useState(null); // 상태 이름을 communityData로 변경  console.log("communityId:", communityId); // communityId가 제대로 전달되는지 확인
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  const { user } = useAuth(); // 현재 로그인한 사용자 정보
  const community = getCommunityById(communityId);
  console.log("해당 게시글:", community); // 해당 게시글이 제대로 불러와지는지 확인

  useEffect(() => {
    let isMounted = true; // 마운트 상태를 추적

    async function loadCommunity() {
      try {
        const data = await getCommunityById(communityId);
        if (isMounted) {
          setCommunityData(data);
        }
      } catch (error) {
        console.error("커뮤니티 게시글 가져오기 오류:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCommunity();

    return () => {
      isMounted = false; // cleanup 함수에서 마운트 상태를 false로 설정
    };
  }, [communityId]);

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      try {
        const image = await fetchCommunityImage(communityId);
        if (isMounted) {
          setImageUrl(image);
        }
      } catch (error) {
        console.warn("이미지가 없는 게시물입니다.");
        setImageUrl(null); // 이미지가 없음을 명시
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [communityId]);

  if (!communityData) return <div>Loading...</div>;

  // communityData가 없으면 리디렉션
  if (!communityData) return <Navigate to="/communities" />;

  const { title, created_at, content, answers, writer_id, image } =
    communityData;

  return (
    <>
      <div className={styles.header}>
        <Container>
          <div className={styles.community}>
            <div className={styles.communityInfo}>
              <div className={styles.content}>
                <div className={styles.title}>
                  {communityData.title}
                  {answers.length > 0 && (
                    <span className={styles.count}>{answers.length}</span>
                  )}
                </div>
                <div className={styles.date}>
                  <DateText value={created_at} />
                </div>
              </div>
              <Writer className={styles.author} writerId={writer_id} />
            </div>

            {/* 이미지가 있을 경우 렌더링 */}
            {communityData.image && (
              <div className={styles.imageContainer}>
                <img
                  src={imageUrl}
                  alt="게시물 이미지"
                  className={styles.communityImage}
                />
              </div>
            )}

            <p
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: communityData.content }}
            />
          </div>
        </Container>
      </div>
      <Container className={styles.answers}>
        <h2 className={styles.count}>
          <Lined>{answers.length}개 답변</Lined>
        </h2>
        {answers.length > 0 ? (
          answers.map((answer) => (
            <Answer
              key={answer.id}
              className={styles.answerItem}
              answer={answer}
            />
          ))
        ) : (
          <Warn
            title="답변을 기다리고 있어요."
            description="이 질문의 첫 번째 답변을 달아주시겠어요?"
          />
        )}
      </Container>
    </>
  );
}

function Writer({ className, writerId }) {
  if (!writerId) return null; // writer 또는 writer.name이 없을 경우 null 반환
  return (
    <div className={classNames(className, styles.writer)}>
      <div className={styles.info}>
        <div className={styles.name}>{writerId}</div>
      </div>
      <Avatar src={"profile.jpg"} alt={writerId} />
    </div>
  );
}

function Answer({ className, answer }) {
  return (
    <Card className={classNames(styles.answer, className)} key={answer.id}>
      <p dangerouslySetInnerHTML={{ __html: answer.content }} />
      <div className={styles.answerInfo}>
        <div className={styles.date}>
          <DateText value={answer.created_at} />
        </div>
        <Writer writerId={answer.writer_id} />
      </div>
    </Card>
  );
}

export default CommunityPage;
