//텍스트 입력 필드를 렌더링
import styles from "./Input.module.css";

function Input({ className = "", children, ...rest }) {
  return (
    <input className={`${styles.Input} ${className}`} {...rest}>
      {children}
    </input>
  );
}

export default Input;
