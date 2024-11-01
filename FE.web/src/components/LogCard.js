import styles from "./LogCard.module.css";

function LogCard({ className = "", children, onClick }) {
  return (
    <div className={`${styles.LogCard} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export default LogCard;
