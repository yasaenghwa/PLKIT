// WebView.js
import React from "react";
import PropTypes from "prop-types";
import css from "./Webview.module.less";

const WebView = ({ url, onClose }) => {
  return (
    <div className={css.webviewContainer}>
      <iframe src={url} className={css.webviewFrame} title="WebView" />
      <button className={css.closeButton} onClick={onClose}>
        닫기
      </button>
    </div>
  );
};

WebView.propTypes = {
  url: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default WebView;
