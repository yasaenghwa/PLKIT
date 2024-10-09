import kind from "@enact/core/kind";

const ControlPanel = kind({
  name: "ControlPanel",

  render: (props) => (
    <div {...props}>
      <h1>Control Page</h1>
      <p>Here you can control various aspects of your system.</p>
    </div>
  ),
});

export default ControlPanel;
