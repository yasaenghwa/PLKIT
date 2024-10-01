import kind from "@enact/core/kind";
import ThemeDecorator from "@enact/sandstone/ThemeDecorator";
import Panels from "@enact/sandstone/Panels";
import Scroller from "@enact/sandstone/Scroller";

import Dashboard from "../components/Dashboard"; // 기존의 Dashboard 컴포넌트를 가져옴

import css from "../App/App.module.less";

const MainPanel = kind({
  name: "MainPanel",

  styles: {
    css,
    className: "app",
  },

  render: (props) => {
    console.log("App component is rendering"); // 콘솔 로그 추가
    return (
      <div {...props}>
        <Panels>
          <Scroller>
            {" "}
            {/* Scroller로 Panels 감싸기 */}
            <Dashboard />
          </Scroller>
        </Panels>
      </div>
    );
  },
});

export default ThemeDecorator(MainPanel);
