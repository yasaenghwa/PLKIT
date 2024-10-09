import React, { useState } from "react";
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

const Overview = () => {
  // useState를 컴포넌트 최상위에서 호출
  const [tempHumSlide, setTempHumSlide] = useState(0);
  const [illuminationSlide, setIlluminationSlide] = useState(0);
  const [tdsSlide, setTdsSlide] = useState(0);
  const [liquidTempSlide, setLiquidTempSlide] = useState(0);

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
      <h1>Overview</h1>
      <Layout orientation="vertical" className={styles.dashboard}>
        <EnactCell>
          <Heading showLine>Farm Air Temperature and Humidity</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tempHumDataChunks[tempHumSlide]}>
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
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
          <button
            onClick={() =>
              prevSlide(tempHumSlide, setTempHumSlide, tempHumDataChunks)
            }
            disabled={tempHumSlide === 0}
          >
            Previous
          </button>
          <button
            onClick={() =>
              nextSlide(tempHumSlide, setTempHumSlide, tempHumDataChunks)
            }
            disabled={tempHumSlide === tempHumDataChunks.length - 1}
          >
            Next
          </button>
        </EnactCell>

        <div className={styles.divider}></div>

        <EnactCell>
          <Heading showLine>Water Level</Heading>
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
        </EnactCell>

        <div className={styles.divider}></div>

        <EnactCell>
          <Heading showLine>Illumination</Heading>
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
            onClick={() =>
              prevSlide(
                illuminationSlide,
                setIlluminationSlide,
                illuminationDataChunks
              )
            }
            disabled={illuminationSlide === 0}
          >
            Previous
          </button>
          <button
            onClick={() =>
              nextSlide(
                illuminationSlide,
                setIlluminationSlide,
                illuminationDataChunks
              )
            }
            disabled={illuminationSlide === illuminationDataChunks.length - 1}
          >
            Next
          </button>
        </EnactCell>

        <div className={styles.divider}></div>

        <EnactCell>
          <Heading showLine>TDS</Heading>
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
            onClick={() => prevSlide(tdsSlide, setTdsSlide, tdsDataChunks)}
            disabled={tdsSlide === 0}
          >
            Previous
          </button>
          <button
            onClick={() => nextSlide(tdsSlide, setTdsSlide, tdsDataChunks)}
            disabled={tdsSlide === tdsDataChunks.length - 1}
          >
            Next
          </button>
        </EnactCell>

        <div className={styles.divider}></div>

        <EnactCell>
          <Heading showLine>Farm Liquid Temperature</Heading>
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
            onClick={() =>
              prevSlide(
                liquidTempSlide,
                setLiquidTempSlide,
                liquidTempDataChunks
              )
            }
            disabled={liquidTempSlide === 0}
          >
            Previous
          </button>
          <button
            onClick={() =>
              nextSlide(
                liquidTempSlide,
                setLiquidTempSlide,
                liquidTempDataChunks
              )
            }
            disabled={liquidTempSlide === liquidTempDataChunks.length - 1}
          >
            Next
          </button>
        </EnactCell>

        <div className={styles.divider}></div>

        <EnactCell>
          <Heading showLine>Water vs Nutrient</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: "Water", value: predictionData[latestIndex].water },
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
        </EnactCell>

        <EnactCell>
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
        </EnactCell>
        <div className={styles.divider}></div>
      </Layout>
      <FloatingButton />
    </div>
  );
};

export default Overview;
