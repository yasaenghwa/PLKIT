import classNames from 'classnames';
import Container from './Container';
import styles from './ListPage.module.css';
import catalog from '../assets/catalog.svg';
import community from '../assets/community.svg';

const ICON = {
  catalog: {
    src: catalog,
    alt: '책',
  },
  community: {
    src: community,
    alt: '말풍선',
  },
};

function ListPage({
  variant = 'catalog',
  title = '',
  description = '',
  children,
}) {
  const icon = ICON[variant] || ICON.catalog;
  return (
    <>
      <div className={classNames(styles.bg, styles[variant])}>
        <img className={styles.icon} src={icon.src} alt={icon.alt} />
        <div className={styles.texts}>
          <h1 className={styles.heading}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
      <Container className={styles.container}>{children}</Container>
    </>
  );
}

export default ListPage;
