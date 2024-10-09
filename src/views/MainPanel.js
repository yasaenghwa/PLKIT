import kind from "@enact/core/kind";
import ThemeDecorator from "@enact/sandstone/ThemeDecorator";
import Panels from "@enact/sandstone/Panels";
import { Spottable } from "@enact/spotlight/Spottable";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import SpotlightRootDecorator from "@enact/spotlight/SpotlightRootDecorator";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"; // react-router-dom 가져오기

import Overview from "../components/Overview"; // Overview 컴포넌트 가져오기
import Control from "../components/Control"; // Control 컴포넌트 가져오기
import FloatingButton from "../components/FloatingButton"; // 플로팅 버튼 임포트
import logo from "../assets/logo.png"; // 로고 이미지 추가
import css from "../App/App.module.less";

// Spottable을 적용한 버튼
const SpottableButton = Spottable(Link); // Link 컴포넌트를 SpottableButton으로 만듭니다.

// 네비게이션 컨테이너
const Nav = SpotlightContainerDecorator("nav");

const MainPanel = kind({
  name: "MainPanel",

  styles: {
    css,
    className: "app",
  },

  render: (props) => {
    return (
      <Router>
        <div {...props} className={css.scrollContainer}>
          <Panels>
            {/* 왼쪽 네비게이션 바와 오른쪽 콘텐츠 영역 */}
            <div style={{ display: "flex", height: "100vh" }}>
              {/* 왼쪽 네비게이션 바 */}
              <Nav className={css.navBar}>
                {/* 로고 이미지 추가 */}
                <div className={css.logoContainer}>
                  <img src={logo} alt="PLKIT Logo" className={css.logo} />
                </div>

                {/* 라우팅을 위한 Link로 변경 */}
                <SpottableButton to="/" className={css.navButton}>
                  Overview
                </SpottableButton>
                <SpottableButton to="/control" className={css.navButton}>
                  Control
                </SpottableButton>
              </Nav>

              {/* 오른쪽 콘텐츠 영역 */}
              <div style={{ flexGrow: 1, overflowY: "auto" }}>
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/control" element={<Control />} />
                </Routes>
              </div>
            </div>
          </Panels>

          {/* 플로팅 버튼 */}
          <FloatingButton />
        </div>
      </Router>
    );
  },
});

export default SpotlightRootDecorator(ThemeDecorator(MainPanel));
