import React from "react";
import "../App.css";

const Control = ({
  fan,
  setFan, // 이 함수가 MQTT 전송을 포함
  heater,
  setHeater, // 이 함수가 MQTT 전송을 포함
  ledLight,
  setLedLight, // 이 함수가 MQTT 전송을 포함
  tank1,
  setTank1,
  tank2,
  setTank2,
  tank3,
  setTank3,
  tank4,
  setTank4,
  waterLevel,
  handleWaterLevelChange, // 이 함수가 MQTT 전송을 포함
}) => {
  return (
    <div>
      <h1>Control</h1>
      <div className="control-grid-layout">
        <div className="control-left">
          <div className="control-card">
            <h3>Fan</h3>
            <label className="switch">
              <input
                type="checkbox"
                className="checkbox"
                checked={fan}
                onChange={setFan} // MQTT로 팬 상태 전송
              />
              <div className="slider"></div>
            </label>
          </div>
          <div className="control-card">
            <h3>Heater</h3>
            <label className="switch">
              <input
                type="checkbox"
                className="checkbox"
                checked={heater}
                onChange={setHeater} // MQTT로 히터 상태 전송
              />
              <div className="slider"></div>
            </label>
          </div>
          <div className="control-card">
            <h3>LED Light</h3>
            <label className="switch">
              <input
                type="checkbox"
                className="checkbox"
                checked={ledLight}
                onChange={setLedLight} // MQTT로 LED 상태 전송
              />
              <div className="slider"></div>
            </label>
          </div>
        </div>

        <div className="control-right">
          <div className="slider-container control-card">
            <h3>Pump</h3>
            <div className="slider-wrapper">
              <select>
                <option value="tank1">Tank 1</option>
              </select>
              <input
                type="range"
                min="0"
                max="100"
                value={tank1}
                onChange={(e) => setTank1(e.target.value)} // 슬라이더 값 전송
              />
            </div>
            <div className="slider-wrapper">
              <select>
                <option value="tank2">Tank 2</option>
              </select>
              <input
                type="range"
                min="0"
                max="100"
                value={tank2}
                onChange={(e) => setTank2(e.target.value)} // 슬라이더 값 전송
              />
            </div>
            <div className="slider-wrapper">
              <select>
                <option value="tank3">Tank 3</option>
              </select>
              <input
                type="range"
                min="0"
                max="100"
                value={tank3}
                onChange={(e) => setTank3(e.target.value)} // 슬라이더 값 전송
              />
            </div>
            <div className="slider-wrapper">
              <select>
                <option value="tank4">Tank 4</option>
              </select>
              <input
                type="range"
                min="0"
                max="100"
                value={tank4}
                onChange={(e) => setTank4(e.target.value)} // 슬라이더 값 전송
              />
            </div>
          </div>

          <div className="control-card">
            <h3>Water Level</h3>
            <input
              type="number"
              min="0"
              max="100"
              value={waterLevel}
              onChange={(e) => handleWaterLevelChange(e.target.value)} // 수위 전송
            />
            {/* 단계 선택 */}
            <div
              className="level-buttons"
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => handleWaterLevelChange(25)}
                style={{ width: "100px" }}
              >
                1단계 (25)
              </button>
              <button
                onClick={() => handleWaterLevelChange(50)}
                style={{ width: "100px" }}
              >
                2단계 (50)
              </button>
              <button
                onClick={() => handleWaterLevelChange(75)}
                style={{ width: "100px" }}
              >
                3단계 (75)
              </button>
              <button
                onClick={() => handleWaterLevelChange(100)}
                style={{ width: "100px" }}
              >
                4단계 (100)
              </button>
            </div>
            <p>Current Water Level: {waterLevel}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Control;
