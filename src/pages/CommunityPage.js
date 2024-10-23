import classNames from "classnames";
import { Navigate, useParams } from "react-router-dom";
import { getCommunityById } from "../api";
import Avatar from "../components/Avatar";
import Card from "../components/Card";
import Container from "../components/Container";
import DateText from "../components/DateText";
import Lined from "../components/Lined";
import Warn from "../components/Warn";
import styles from "./CommunityPage.module.css";

function CommunityPage() {
  const { communityId } = useParams();
  console.log("communityId:", communityId); // communityId가 제대로 전달되는지 확인

  const community = getCommunityById(communityId);
  console.log("해당 게시글:", community); // 해당 게시글이 제대로 불러와지는지 확인

  if (!community) return <Navigate to="/communitys" />;

  return (
    <>
      <div className={styles.header}>
        <Container>
          <div className={styles.community}>
            <div className={styles.communityInfo}>
              <div className={styles.content}>
                <div className={styles.title}>
                  {community.title}
                  {community.answers > 0 && (
                    <span className={styles.count}>
                      {community.answers.length}
                    </span>
                  )}
                </div>
                <div className={styles.date}>
                  <DateText value={community.createdAt} />
                </div>
              </div>
              <Writer className={styles.author} writer={community.writer} />
            </div>

            {/* 이미지가 있을 경우 렌더링 */}
            {community.image && (
              <div className={styles.imageContainer}>
                <img
                  src={community.image}
                  alt="게시물 이미지"
                  className={styles.communityImage}
                />
              </div>
            )}

            <p
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: community.content }}
            />
          </div>
        </Container>
      </div>
      <Container className={styles.answers}>
        <h2 className={styles.count}>
          <Lined>{community.answers.length}개 답변</Lined>
        </h2>
        {community.answers.length > 0 ? (
          community.answers.map((answer) => (
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

function Writer({ className, writer }) {
  // writer.avatar 확인을 위한 console.log
  console.log("Writer component - writer.avatar:", writer.avatar);

  return (
    <div className={classNames(className, styles.writer)}>
      <div className={styles.info}>
        <div className={styles.name}>{writer.name}</div>
      </div>
      <Avatar src={writer.profile.photo || "profile.jpg"} alt={writer.name} />
    </div>
  );
}

function Answer({ className, answer }) {
  return (
    <Card className={classNames(styles.answer, className)} key={answer.id}>
      <p dangerouslySetInnerHTML={{ __html: answer.content }} />
      <div className={styles.answerInfo}>
        <div className={styles.date}>
          <DateText value={answer.createdAt} />
        </div>
        <Writer writer={answer.writer} />
      </div>
    </Card>
  );
}

export default CommunityPage;
