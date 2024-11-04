import React from "react";
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
  Cell,
} from "recharts";
import "../App.css";

const Overview = ({ data }) => {
  if (!data) {
    return <div>Loading...</div>;
  }

  const {
    tempHumData,
    waterLevelData,
    illuminationData,
    tdsData,
    liquidTempData,
    pieData,
    predictionData,
  } = data;

  // 가장 최근 데이터를 가져오기
  const latestData = data.predictionData[data.predictionData.length - 1];

  return (
    <div className="Overview">
      <h1>Overview</h1>
      <div className="dashboard">
        <div className="card">
          <h3>Farm Air Temperature and Humidity</h3>
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
        </div>

        <div className="card">
          <h3>Water Level</h3>
          <div className="water-level">
            {waterLevelData.map((level, index) => (
              <div key={index} className="water-level-item">
                <span>{level.name} (water level)</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${level.value}%` }}
                  ></div>
                </div>
                <span>{level.value}% Correct</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Illumination</h3>
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
        </div>

        <div className="card">
          <h3>TDS</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tdsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Bar dataKey="tds" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Farm Liquid Temperature</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={liquidTempData}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temp" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Water vs Nutrient</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#0088FE", "#FFBB28"][index % 2]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card double-card" style={{ width: "100%" }}>
          <h3>Water and Nutrient Solution Prediction</h3>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "50%" }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={predictionData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid stroke="#ccc" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="water" fill="#00C49F" />
                  <Bar dataKey="nutrient" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                width: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                fontSize: "20px",
                color: "#FFF",
              }}
            >
              <p>
                - Water는
                <span
                  style={{
                    backgroundColor: "#00C49F",
                    color: "#FFF",
                    padding: "0 8px",
                    borderRadius: "5px",
                    margin: "0 5px",
                  }}
                >
                  {latestData.water}일
                </span>
                정도 사용 가능합니다!
              </p>
              <p>
                - Nutrient는
                <span
                  style={{
                    backgroundColor: "#FFBB28",
                    color: "#FFF",
                    padding: "0 8px",
                    borderRadius: "5px",
                    margin: "0 5px",
                  }}
                >
                  {latestData.nutrient}일
                </span>
                정도 사용 가능합니다!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
