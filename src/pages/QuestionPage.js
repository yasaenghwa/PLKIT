import classNames from 'classnames';
import { Navigate, useParams } from 'react-router-dom';
import { getQuestionById } from '../api';
import Avatar from '../components/Avatar';
import Card from '../components/Card';
import Container from '../components/Container';
import DateText from '../components/DateText';
import Lined from '../components/Lined';
import Warn from '../components/Warn';
import styles from './QuestionPage.module.css';

function QuestionPage() {
  const { questionId } = useParams();
  const question = getQuestionById(questionId);

  if (!question) return <Navigate to="/questions" />;

  return (
    <>
      <div className={styles.header}>
        <Container>
          <div className={styles.question}>
            <div className={styles.questionInfo}>
              <div className={styles.content}>
                <div className={styles.title}>
                  {question.title}
                  {question.answers > 0 && (
                    <span className={styles.count}>
                      {question.answers.length}
                    </span>
                  )}
                </div>
                <div className={styles.date}>
                  <DateText value={question.createdAt} />
                </div>
              </div>
              <Writer className={styles.author} writer={question.writer} />
            </div>
            <p
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: question.content }}
            />
          </div>
        </Container>
      </div>
      <Container className={styles.answers}>
        <h2 className={styles.count}>
          <Lined>{question.answers.length}개 답변</Lined>
        </h2>
        {question.answers.length > 0 ? (
          question.answers.map((answer) => (
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

export default QuestionPage;
