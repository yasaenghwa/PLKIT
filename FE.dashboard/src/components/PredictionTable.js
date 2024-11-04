// PredictionTable.js

import React from "react";
import styles from "./TableStyles.module.less"; // 테이블 스타일 임포트

const PredictionTable = ({ data }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Water (days)</th>
          <th>Nutrient (days)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index}>
            <td>{entry.name}</td>
            <td>{entry.water}</td>
            <td>{entry.nutrient}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PredictionTable;
