// Flowcheck.js
import kind from "@enact/core/kind";

const Flowcheck = kind({
  name: "Flowcheck",

  render: (props) => {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <iframe
          src="http://220.149.85.28/" // 원하는 링크로 변경하세요
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
    );
  },
});

export default Flowcheck;
