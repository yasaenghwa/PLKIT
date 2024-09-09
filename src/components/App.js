import { Outlet } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import styles from "./App.module.css";
import "./App.font.css";
import { AuthProvider } from "../contexts/AuthProvider"; // 사용자 인증 정보를 애플리케이션 전역에서 사용
import ToasterProvider from "../contexts/ToasterProvider"; //알림(토스트 메시지)을 관리

function Providers({ children }) {
  return (
    <ToasterProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToasterProvider>
  );
}

function App() {
  return (
    <Providers>
      <Nav className={styles.nav} />
      <div className={styles.body}>
        <Outlet />
      </div>
      <Footer className={styles.footer} />
    </Providers>
  );
}

export default App;
