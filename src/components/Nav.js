import React from "react";
import { Spottable } from "@enact/spotlight/Spottable";
import { SpotlightRootDecorator } from "@enact/spotlight/SpotlightRootDecorator";
import kind from "@enact/core/kind";
import { Link, Switch, Route } from "react-router-dom";
import Overview from "./Overview";
import Control from "./Control";

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
      {/*
      <Link to="/flowcheck">
        <NavButton>Flow Check</NavButton>
      </Link>
      <Link to="/community">
        <NavButton>Community</NavButton>
      </Link>
      */}
    </div>
  );
};

export default Nav;
