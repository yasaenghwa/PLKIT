import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteWishlist, getWishlist } from '../api';
import Button from '../components/Button';
import Container from '../components/Container';
import CourseItem from '../components/CourseItem';
import Warn from '../components/Warn';
import closeButton from '../assets/closeButton.svg';
import styles from './WishlistPage.module.css';

function WishlistPage() {
  const [courses, setCourses] = useState([]);

  const handleDelete = (courseSlug) => {
    deleteWishlist(courseSlug);
    const nextCourses = getWishlist();
    setCourses(nextCourses);
  };

  useEffect(() => {
    const nextCourses = getWishlist();
    setCourses(nextCourses);
  }, []);

  return (
    <Container className={styles.container}>
      <h1 className={styles.title}>나의 위시리스트</h1>
      {courses.length === 0 ? (
        <>
          <Warn
            className={styles.emptyList}
            title="담아 놓은 코스가 없어요."
            description="카탈로그에서 나에게 필요한 코스를 찾아보세요."
          />
          <div className={styles.link}>
            <Link to="/courses">
              <Button as="div">코스 찾아보기</Button>
            </Link>
          </div>
        </>
      ) : (
        <ul className={styles.items}>
          {courses.map((course) => (
            <li key={course.slug} className={styles.item}>
              <CourseItem course={course} />
              <img
                className={styles.delete}
                src={closeButton}
                alt="닫기"
                onClick={() => handleDelete(course.slug)}
              />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

export default WishlistPage;
