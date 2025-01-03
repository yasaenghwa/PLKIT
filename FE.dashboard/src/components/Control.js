import React from "react"; // React를 가져옵니다
import Button from "@enact/sandstone/Button";
import SwitchItem from "@enact/sandstone/SwitchItem";
import Slider from "@enact/sandstone/Slider";
import Input from "@enact/sandstone/Input";
import Dropdown from "@enact/sandstone/Dropdown";
import useSmartFarmData from "../hooks/useSmartFarmData"; // 커스텀 훅 가져오기
import styles from "../App/App.module.less"; // CSS를 module 형식으로 변경
import FloatingButton from "./FloatingButton"; // 모달리스 버튼 가져오기

const Control = () => {
  // useSmartFarmData에서 필요한 데이터와 함수들을 구조 분해 할당
  const {
    fan,
    toggleFan,
    heater,
    toggleHeater,
    ledLight,
    toggleLedLight,
    tank1,
    setTank1,
    tank2,
    setTank2,
    tank3,
    setTank3,
    tank4,
    setTank4,
    waterLevel,
    handleWaterLevelChange,
    handleTankChange,
  } = useSmartFarmData();

  return (
    <div>
      <h1>&nbsp;&nbsp;&nbsp;Control</h1>
      <div className={styles.controlGridLayout}>
        <div className={styles.controlLeft}>
          <div className={styles.controlCard}>
            <h3>Fan</h3>
            <SwitchItem selected={fan} onToggle={toggleFan}>
              Fan
            </SwitchItem>

            <h3>Heater</h3>
            <SwitchItem selected={heater} onToggle={toggleHeater}>
              Heater
            </SwitchItem>

            <h3>LED Light</h3>
            <SwitchItem selected={ledLight} onToggle={toggleLedLight}>
              LED Light
            </SwitchItem>
          </div>
        </div>

        <div className={styles.controlRight}>
          <div className={styles.sliderContainer}>
            <div className={styles.controlCard}>
              <h3>Pump</h3>

              {/* Tank 1 */}
              <div className="slider-wrapper">
                <Dropdown title="Tank 1">{["Tank 1"]}</Dropdown>
                <Slider
                  min={0}
                  max={100}
                  value={tank1}
                  onChange={({ value }) => {
                    console.log("Tank 1 value changed to:", value);
                    handleTankChange(1, value); // handleTankChange 호출
                  }}
                />
              </div>

              {/* Tank 2 */}
              <div className="slider-wrapper">
                <Dropdown title="Tank 2">{["Tank 2"]}</Dropdown>
                <Slider
                  min={0}
                  max={100}
                  value={tank2}
                  onChange={({ value }) => {
                    console.log("Tank 2 value changed to:", value);
                    handleTankChange(2, value); // handleTankChange 호출
                  }}
                />
              </div>

              {/* Tank 3 */}
              <div className="slider-wrapper">
                <Dropdown title="Tank 3">{["Tank 3"]}</Dropdown>
                <Slider
                  min={0}
                  max={100}
                  value={tank3}
                  onChange={({ value }) => {
                    console.log("Tank 3 value changed to:", value);
                    handleTankChange(3, value); // handleTankChange 호출
                  }}
                />
              </div>

              {/* Tank 4 */}
              <div className="slider-wrapper">
                <Dropdown title="Tank 4">{["Tank 4"]}</Dropdown>
                <Slider
                  min={0}
                  max={100}
                  value={tank4}
                  onChange={({ value }) => {
                    console.log("Tank 4 value changed to:", value);
                    handleTankChange(4, value); // handleTankChange 호출
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.controlCard}>
            <h3>Water Level</h3>
            <Input
              type="number"
              min={0}
              max={100}
              value={waterLevel}
              maxLength={3} // 최대 3자리 숫자 입력 제한
              onChange={({ value }) => handleWaterLevelChange(value)}
            />
            <div>
              <Button
                onClick={() => handleWaterLevelChange(25)}
                style={{ width: "100px" }}
              >
                1단계 (25)
              </Button>
              <Button
                onClick={() => handleWaterLevelChange(50)}
                style={{ width: "100px" }}
              >
                2단계 (50)
              </Button>
              <Button
                onClick={() => handleWaterLevelChange(75)}
                style={{ width: "100px" }}
              >
                3단계 (75)
              </Button>
              <Button
                onClick={() => handleWaterLevelChange(100)}
                style={{ width: "100px" }}
              >
                4단계 (100)
              </Button>
            </div>
            <p className={styles.waterLevelText}>
              Current Water Level: {waterLevel}%
            </p>
          </div>
        </div>
      </div>
      <FloatingButton />
    </div>
  );
};

export default Control;
