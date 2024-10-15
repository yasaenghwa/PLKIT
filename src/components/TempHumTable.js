// TempHumTable.js

import React from "react";
import styles from "./TableStyles.module.less"; // 테이블 스타일 임포트

const TempHumTable = ({ data }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Temperature (°C)</th>
          <th>Humidity (%)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index}>
            <td>{entry.name}</td>
            <td>{entry.temp}</td>
            <td>{entry.hum}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TempHumTable;
