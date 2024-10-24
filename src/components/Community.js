// Community.js
import kind from "@enact/core/kind";

const Community = kind({
  name: "Community",

  render: (props) => {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <iframe
          src="https://test-chi-three-99.vercel.app/" // 원하는 링크로 변경하세요
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
    );
  },
});

export default Community;
