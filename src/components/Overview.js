//prediction의 값은 현재 더미 데이터로 구성되어있으니, ai 예측 데이터 생성시 업데이트 하겠습니다.
import { Heading } from "@enact/sandstone/Heading";
import { Layout } from "@enact/ui/Layout";
import { Cell as EnactCell } from "@enact/ui/Layout";
import { Cell as RechartsCell } from "recharts";
//import React from "react";
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

const Overview = ({ data }) => {
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

  const latestData = predictionData[predictionData.length - 1];
  const latestIndex = predictionData.length - 1;

  return (
    <div className="Overview">
      <h1>Overview</h1>
      <Layout orientation="vertical" className={styles.dashboard}>
        <EnactCell>
          <Heading showLine>Farm Air Temperature and Humidity</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tempHumData}>
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
            <BarChart data={illuminationData}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Bar dataKey="light" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </EnactCell>

        <div className={styles.divider}></div>

        <EnactCell>
          <Heading showLine>TDS</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tdsData}>
              <XAxis dataKey="name" interval={0} tick={{ fontSize: 10 }} />
              <YAxis />
              <CartesianGrid stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Bar dataKey="tds" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </EnactCell>

        <div className={styles.divider}></div>

        <EnactCell>
          <Heading showLine>Farm Liquid Temperature</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={liquidTempData}
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
    </div>
  );
};

export default Overview;
