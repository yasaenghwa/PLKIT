// IlluminationTable.js

import React from "react";
import styles from "./TableStyles.module.less"; // 테이블 스타일 임포트

const IlluminationTable = ({ data }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Illumination (lx)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index}>
            <td>{entry.name}</td>
            <td>{entry.light}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default IlluminationTable;
