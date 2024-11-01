import React, { useState } from "react";
import Button from "@enact/sandstone/Button";
import Popup from "@enact/sandstone/Popup";
import WebView from "./Webview"; // WebView 컴포넌트 임포트
import css from "./FloatingButton.module.less"; // 스타일을 모듈로 가져오기
import ChatGPTComponent from "./ChatGPTComponent"; // ChatGPT 컴포넌트 임포트import FloatingLayer from "@enact/ui/FloatingLayer"; // FloatingLayer 임포트
import FloatingLayer from "@enact/ui/FloatingLayer";
import styles from "./FloatingButton.module.less"; // 스타일을 import

const FloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWebViewOpen, setIsWebViewOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // AI Chat 상태 추가

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const openWebView = () => {
    console.log("openWebView called");
    setIsOpen(false); // 팝업 닫기
    setIsWebViewOpen(true); // 웹뷰 열기
  };

  const closeWebView = () => {
    setIsWebViewOpen(false);
  };

  const openChat = () => {
    console.log("AI Chat 버튼 클릭됨");
    setIsOpen(false); // 팝업 닫기
    setIsChatOpen(true); // AI Chat 열기
  };

  const closeChat = () => {
    console.log("AI Chat 닫기");
    setIsChatOpen(false); // AI Chat 닫기
  };

  return (
    <div>
      {/* FloatingLayer로 플로팅 액션 버튼을 구현 */}
      <FloatingLayer open noAutoDismiss scrimType="none">
        <div className={css.fabContainer}>
          <Button
            onClick={togglePopup}
            className={css.fab}
            icon="plus"
            iconOnly
            aria-label="메뉴 열기"
          />
        </div>
      </FloatingLayer>

      {/* Popup 창을 FloatingLayer로 감싸기 */}
      <FloatingLayer open={isOpen} noAutoDismiss scrimType="none">
        <Popup
          open={isOpen}
          onClose={togglePopup}
          //scrimType="none" // 화면 어두워짐 효과 제거
          className={css.popupContainer}
          position="center"
        >
          <div className={css.popupContent}>
            <Button onClick={openWebView}>Flow check</Button>
            <Button onClick={openChat}>AI chat</Button>
          </div>
        </Popup>
      </FloatingLayer>

      {/* WebView 컴포넌트 */}
      {isWebViewOpen && (
        <FloatingLayer open>
          <WebView url="http://220.149.85.28/" onClose={closeWebView} />
        </FloatingLayer>
      )}

      {/* Chat 팝업 */}
      {isChatOpen && (
        <FloatingLayer open>
          <Popup
            open={isChatOpen}
            onClose={closeChat}
            scrimType="none"
            className={css.chatPopupContent} // 스타일 적용
          >
            <ChatGPTComponent />
          </Popup>
        </FloatingLayer>
      )}
    </div>
  );
};

export default FloatingButton;
