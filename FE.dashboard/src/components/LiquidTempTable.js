// LiquidTempTable.js

import React from "react";
import styles from "./TableStyles.module.less"; // 테이블 스타일 임포트

const LiquidTempTable = ({ data }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Liquid Temperature (°C)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index}>
            <td>{entry.name}</td>
            <td>{entry.temp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LiquidTempTable;
