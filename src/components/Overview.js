import React, { useRef, useState } from "react";
import { Heading } from "@enact/sandstone/Heading";
import { Layout } from "@enact/ui/Layout";
import { Cell as EnactCell } from "@enact/ui/Layout";
import { Cell as RechartsCell } from "recharts";
import useSmartFarmData from "../hooks/useSmartFarmData"; // 커스텀 훅 가져오기
import FloatingButton from "./FloatingButton"; // 모달리스 버튼 가져오기

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import styles from "../App/App.module.less"; // CSS를 module 형식으로 변경

// 테이블 컴포넌트 임포트
import TempHumTable from "./TempHumTable";
import WaterLevelTable from "./WaterLevelTable";
import IlluminationTable from "./IlluminationTable";
import TdsTable from "./TdsTable";
import LiquidTempTable from "./LiquidTempTable";
import PredictionTable from "./PredictionTable";

// 유틸리티 함수 임포트
//import { saveChartAsPDF, saveChartAsWord } from "../utils/exportChart";

const Overview = () => {
  // useState를 컴포넌트 최상위에서 호출
  const [tempHumSlide, setTempHumSlide] = useState(0);
  const [illuminationSlide, setIlluminationSlide] = useState(0);
  const [tdsSlide, setTdsSlide] = useState(0);
  const [liquidTempSlide, setLiquidTempSlide] = useState(0);

  // 각 차트의 뷰 모드 상태 관리 ('chart' 또는 'table')
  const [viewModes, setViewModes] = useState({
    tempHumData: "chart",
    waterLevelData: "chart",
    illuminationData: "chart",
    tdsData: "chart",
    liquidTempData: "chart",
    predictionData: "chart",
  });

  // 뷰 모드 토글 함수
  const toggleViewMode = (key) => {
    setViewModes((prevModes) => ({
      ...prevModes,
      [key]: prevModes[key] === "chart" ? "table" : "chart",
    }));
  };

  // 차트에 대한 ref 생성
  const tempHumChartRef = useRef(null);
  const waterLevelChartRef = useRef(null);
  const illuminationChartRef = useRef(null);
  const tdsChartRef = useRef(null);
  const liquidTempChartRef = useRef(null);
  const predictionChartRef = useRef(null);

  const { data } = useSmartFarmData(); // 데이터를 가져옵니다.

  if (
    !data ||
    !data.tempHumData ||
    !data.waterLevelData ||
    !data.illuminationData ||
    !data.tdsData ||
    !data.liquidTempData ||
    !data.predictionData
  ) {
    return <div>Loading...</div>;
  }

  const {
    tempHumData,
    waterLevelData,
    illuminationData,
    tdsData,
    liquidTempData,
    predictionData,
  } = data;

  // 데이터를 10개씩 나누기 위한 함수
  const chunkedData = (data, size) => {
    const result = [];
    for (let i = 0; i < data.length; i += size) {
      result.push(data.slice(i, i + size));
    }
    return result;
  };

  // 슬라이드로 표시할 데이터 나누기 (10개씩)
  const tempHumDataChunks = chunkedData(tempHumData, 3);
  const illuminationDataChunks = chunkedData(illuminationData, 10);
  const tdsDataChunks = chunkedData(tdsData, 10);
  const liquidTempDataChunks = chunkedData(liquidTempData, 10);

  // 각 슬라이드 이전/다음으로 이동하는 함수
  const prevSlide = (slide, setSlide, dataChunks) => {
    if (slide > 0) setSlide(slide - 1);
  };

  const nextSlide = (slide, setSlide, dataChunks) => {
    if (slide < dataChunks.length - 1) setSlide(slide + 1);
  };

  const latestData = predictionData[predictionData.length - 1];
  const latestIndex = predictionData.length - 1;

  return (
    <div className="Overview">
      <h1>&nbsp;&nbsp; Overview</h1>
      <Layout orientation="vertical" className={styles.dashboard}>
        {/* 온도 및 습도 */}
        <EnactCell>
          <div onClick={() => toggleViewMode("tempHumData")}>
            <Heading showLine>Farm Air Temperature and Humidity</Heading>
          </div>
          {viewModes.tempHumData === "chart" ? (
            <>
              <div ref={tempHumChartRef}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={tempHumDataChunks[tempHumSlide]}>
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                    />
                    <CartesianGrid stroke="#ccc" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="temp"
                      stroke="#8884d8"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="hum"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* 저장 버튼 
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveChartAsPDF(tempHumChartRef, "Temperature and Humidity");
                }}
              >
                Save as PDF
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveChartAsWord(tempHumChartRef, "Temperature and Humidity");
                }}
              >
                Save as Word
              </button>*/}
              {/* 슬라이드 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide(tempHumSlide, setTempHumSlide);
                }}
                disabled={tempHumSlide === 0}
              >
                Previous
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide(tempHumSlide, setTempHumSlide, tempHumDataChunks);
                }}
                disabled={tempHumSlide === tempHumDataChunks.length - 1}
              >
                Next
              </button>
            </>
          ) : (
            <TempHumTable data={tempHumData} />
          )}
        </EnactCell>

        <div className={styles.divider}></div>

        {/* 수위 */}
        <EnactCell>
          <div onClick={() => toggleViewMode("waterLevelData")}>
            <Heading showLine>Water Level</Heading>
          </div>
          {viewModes.waterLevelData === "chart" ? (
            <div className={styles.waterLevel}>
              {waterLevelData.map((level, index) => (
                <div key={index} className={styles.waterLevelItem}>
                  <span>{level.name} (level) </span>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${level.value}%` }}
                    ></div>
                  </div>
                  <span>{level.value}% Correct</span>
                </div>
              ))}
            </div>
          ) : (
            <WaterLevelTable data={waterLevelData} />
          )}
        </EnactCell>

        <div className={styles.divider}></div>

        {/* 조도 */}
        <EnactCell>
          <div onClick={() => toggleViewMode("illuminationData")}>
            <Heading showLine>Illumination</Heading>
          </div>
          {viewModes.illuminationData === "chart" ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={illuminationDataChunks[illuminationSlide]}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid stroke="#ccc" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="light" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide(illuminationSlide, setIlluminationSlide);
                }}
                disabled={illuminationSlide === 0}
              >
                Previous
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide(
                    illuminationSlide,
                    setIlluminationSlide,
                    illuminationDataChunks
                  );
                }}
                disabled={
                  illuminationSlide === illuminationDataChunks.length - 1
                }
              >
                Next
              </button>
            </>
          ) : (
            <IlluminationTable data={illuminationData} />
          )}
        </EnactCell>

        <div className={styles.divider}></div>

        {/* TDS */}
        <EnactCell>
          <div onClick={() => toggleViewMode("tdsData")}>
            <Heading showLine>TDS</Heading>
          </div>
          {viewModes.tdsData === "chart" ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tdsDataChunks[tdsSlide]}>
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 10 }} />
                  <YAxis />
                  <CartesianGrid stroke="#ccc" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tds" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide(tdsSlide, setTdsSlide);
                }}
                disabled={tdsSlide === 0}
              >
                Previous
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide(tdsSlide, setTdsSlide, tdsDataChunks);
                }}
                disabled={tdsSlide === tdsDataChunks.length - 1}
              >
                Next
              </button>
            </>
          ) : (
            <TdsTable data={tdsData} />
          )}
        </EnactCell>

        <div className={styles.divider}></div>

        {/* 농장 액체 온도 */}
        <EnactCell>
          <div onClick={() => toggleViewMode("liquidTempData")}>
            <Heading showLine>Farm Liquid Temperature</Heading>
          </div>
          {viewModes.liquidTempData === "chart" ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={liquidTempDataChunks[liquidTempSlide]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 10 }} />
                  <YAxis />
                  <CartesianGrid stroke="#ccc" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temp" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide(liquidTempSlide, setLiquidTempSlide);
                }}
                disabled={liquidTempSlide === 0}
              >
                Previous
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide(
                    liquidTempSlide,
                    setLiquidTempSlide,
                    liquidTempDataChunks
                  );
                }}
                disabled={liquidTempSlide === liquidTempDataChunks.length - 1}
              >
                Next
              </button>
            </>
          ) : (
            <LiquidTempTable data={liquidTempData} />
          )}
        </EnactCell>

        <div className={styles.divider}></div>

        {/* 예측 데이터 */}
        <EnactCell>
          <div onClick={() => toggleViewMode("predictionData")}>
            <Heading showLine>Water vs Nutrient</Heading>
          </div>
          {viewModes.predictionData === "chart" ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Water",
                        value: predictionData[latestIndex].water,
                      },
                      {
                        name: "Nutrient",
                        value: predictionData[latestIndex].nutrient,
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    label
                  >
                    <RechartsCell key="cell-0" fill="#0088FE" />
                    <RechartsCell key="cell-1" fill="#FFBB28" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="card double-card" style={{ width: "100%" }}>
                <h3>Water and Nutrient Solution Prediction</h3>
                <div className={styles.chartContainer}>
                  <div className={styles.chartSection}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={predictionData}>
                        <XAxis
                          dataKey="name"
                          interval={0}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis />
                        <CartesianGrid stroke="#ccc" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="water" fill="#00C49F" />
                        <Bar dataKey="nutrient" fill="#FFBB28" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.textSection}>
                    <p>
                      - Water는
                      <span>{latestData.water}일</span>
                      정도 사용 가능합니다!
                    </p>
                    <p>
                      - Nutrient는
                      <span className={styles.nutrientSpan}>
                        {latestData.nutrient}일
                      </span>
                      정도 사용 가능합니다!
                    </p>
                    <p>
                      - recycle은
                      <span className={styles.recycleSpan}>
                        {latestData.water}일
                      </span>
                      정도 사용 가능합니다!
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <PredictionTable data={predictionData} />
          )}
        </EnactCell>

        <div className={styles.divider}></div>
      </Layout>
      <FloatingButton />
    </div>
  );
};

export default Overview;
