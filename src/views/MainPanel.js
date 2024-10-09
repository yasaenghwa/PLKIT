import kind from "@enact/core/kind";
import ThemeDecorator from "@enact/sandstone/ThemeDecorator";
import Panels from "@enact/sandstone/Panels";
import { Scroller } from "@enact/sandstone/Scroller";
import { Spottable } from "@enact/spotlight/Spottable";
import SpotlightContainerDecorator from "@enact/spotlight/SpotlightContainerDecorator";
import SpotlightRootDecorator from "@enact/spotlight/SpotlightRootDecorator";

import Dashboard from "../components/Dashboard"; // 기존의 Dashboard 컴포넌트를 가져옴

import css from "../App/App.module.less";

// Spottable을 적용한 버튼
const SpottableButton = Spottable("button");

// 네비게이션 컨테이너
const Nav = SpotlightContainerDecorator("div");

const MainPanel = kind({
  name: "MainPanel",

  styles: {
    css,
    className: "app",
  },

  render: (props) => {
    console.log("App component is rendering"); // 콘솔 로그 추가
    return (
      <div {...props} className={css.scrollContainer}>
        <Panels>
          {/* 왼쪽 네비게이션 바와 오른쪽 콘텐츠 영역 */}
          <div style={{ display: "flex", height: "100vh" }}>
            {/* 왼쪽 네비게이션 바 */}
            <Nav
              style={{
                width: "200px",
                background: "#ccc",
                padding: "10px",
                flexShrink: 0,
              }}
            >
              <SpottableButton className={css.navButton}>
                Overview
              </SpottableButton>
              <SpottableButton className={css.navButton}>
                Control
              </SpottableButton>
            </Nav>

            {/* 오른쪽 콘텐츠 영역 - Scroller 적용 */}
            <Scroller style={{ flexGrow: 1, overflowY: "auto" }}>
              <Dashboard />
            </Scroller>
          </div>
        </Panels>
      </div>
    );
  },
});

export default SpotlightRootDecorator(ThemeDecorator(MainPanel));
