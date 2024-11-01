import styles from "./LogButton.module.css";

function LogButton({
  className = "",
  appearance = "primary",
  children,
  as: AsComponent,
  ...rest
}) {
  if (AsComponent) {
    return (
      <AsComponent
        className={`${styles.LogButton} ${styles[appearance]} ${className}`}
        {...rest}
      >
        {children}
      </AsComponent>
    );
  }

  return (
    <button
      className={`${styles.LogButton} ${styles[appearance]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default LogButton;
