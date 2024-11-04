import { memo } from "react";

function DateText({ value }) {
  if (!value) return null; // null을 반환하여 아무것도 렌더링하지 않음

  return <span>{new Date(value).toLocaleDateString("ko-KR")}</span>;
}
export default memo(DateText);
