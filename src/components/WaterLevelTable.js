// WaterLevelTable.js

import React from "react";
import styles from "./TableStyles.module.less"; // 테이블 스타일 임포트

const WaterLevelTable = ({ data }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Tank Name</th>
          <th>Level (%)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((level, index) => (
          <tr key={index}>
            <td>{level.name}</td>
            <td>{level.value}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WaterLevelTable;
