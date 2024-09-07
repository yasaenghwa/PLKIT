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
  const community = getCommunityById(communityId);

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
  return (
    <div className={classNames(className, styles.writer)}>
      <div className={styles.info}>
        <div className={styles.name}>{writer.name}</div>
        <div className={styles.level}>{writer.level}</div>
      </div>
      <Avatar photo={writer.profile.photo} name={writer.name} />
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
