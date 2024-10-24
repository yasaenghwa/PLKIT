//적용할지말지 코드...
import React from "react";
import { Spottable } from "@enact/spotlight/Spottable";
import { SpotlightRootDecorator } from "@enact/spotlight/SpotlightRootDecorator";
import kind from "@enact/core/kind";
import { Link, Switch, Route } from "react-router-dom";
import Overview from "./Overview";
import Control from "./Control";
import WebView from "./Webview"; // WebView 컴포넌트 임포트
import VideoStream from "./VideoStream "; // Community 컴포넌트 가져오기

// Spottable NavButton 생성
const NavButton = Spottable(
  kind({
    name: "NavButton",
    render: (props) => (
      <div
        {...props}
        style={{
          padding: "10px",
          margin: "5px",
          background: "#ddd",
          color: "#000",
        }}
      >
        {props.children}
      </div>
    ),
  })
);

// Nav 컴포넌트 생성
const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWebViewOpen, setIsWebViewOpen] = useState(false);

  const openWebView = () => {
    console.log("openWebView called");
    setIsOpen(false); // 팝업 닫기
    setIsWebViewOpen(true); // 웹뷰 열기
  };

  const closeWebView = () => {
    setIsWebViewOpen(false);
  };

  return (
    <div
      style={{
        width: "200px",
        background: "#333",
        color: "#fff",
        padding: "10px",
        height: "100vh",
      }}
    >
      <Link to="/overview">
        <NavButton>Overview</NavButton>
      </Link>
      <Link to="/control">
        <NavButton>Control</NavButton>
      </Link>
      <Link to="/VideoStream">
        <NavButton>VideoStream</NavButton>
      </Link>
      {/*
      <Link to="/flowcheck">
        <NavButton>Flow Check</NavButton>
      </Link>
      */}
      <Link to="/community">
        <NavButton onClick={openWebView}>Community</NavButton>
      </Link>

      {/* WebView 표시 */}
      {isWebViewOpen && (
        <WebView url="http://220.149.85.28/" onClose={closeWebView} />
      )}
    </div>
  );
};

export default Nav;
