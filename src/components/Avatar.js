// Avatar.js
import styles from "./Avatar.module.css";
import defaultAvatarImage from "../assets/default-avatar.svg";

function Avatar({ className, size = "medium", src, alt, ...props }) {
  const avatarSrc = src || defaultAvatarImage; // 서버 URL을 그대로 사용
  return (
    <img
      className={`${styles.Avatar} ${styles[size]} ${className}`}
      src={avatarSrc}
      alt={alt}
      {...props}
    />
  );
}

export default Avatar;
