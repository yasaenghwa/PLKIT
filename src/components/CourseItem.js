import { Link } from 'react-router-dom';
import Card from './Card';
import CourseIcon from './CourseIcon';
import Tags from './Tags';
import getCourseColor from '../utils/getCourseColor';
import styles from './CourseItem.module.css';

const DIFFICULTY = ['입문', '초급', '중급', '고급'];

function CourseItem({ course }) {
  const showSummary = course.summary && course.title !== course.summary;
  const courseColor = getCourseColor(course.code);
  const difficulty = DIFFICULTY[course.difficulty || 0];
  const thumbStyle = {
    borderColor: courseColor,
  };

  return (
    <Card className={styles.courseItem}>
      <div className={styles.thumb} style={thumbStyle}>
        <CourseIcon photoUrl={course.photoUrl} />
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>
          <Link to={`/courses/${course.slug}`}>{course.title}</Link>
        </h2>
        <p className={styles.description}>{showSummary && course.summary}</p>
        <div>
          <Tags values={[course.language, difficulty]} />
        </div>
      </div>
    </Card>
  );
}

export default CourseItem;
