import { useState, useEffect } from "react";
import mqtt from "mqtt"; // mqtt 라이브러리 추가

const useSmartFarmData = () => {
  const [data, setData] = useState({
    tempHumData: null,
    waterLevelData: null,
    illuminationData: null,
    tdsData: null,
    liquidTempData: null,
    predictionData: null,
  });
  const [fan, setFan] = useState(false);
  const [heater, setHeater] = useState(false);
  const [ledLight, setLedLight] = useState(false);
  const [tank1, setTank1] = useState(50);
  const [tank2, setTank2] = useState(50);
  const [tank3, setTank3] = useState(50);
  const [tank4, setTank4] = useState(50);
  const [waterLevel, setWaterLevel] = useState(0);

  // mqttClient를 전역으로 선언
  let mqttClient;

  useEffect(() => {
    // 데이터를 서버로부터 불러오는 함수
    const fetchData = async () => {
      try {
        const tempHumResponse = await fetch(
          "http://13.209.126.231/dummy/status/temp_hum"
        );
        const tempHumData = await tempHumResponse.json();

        const waterLevelResponse = await fetch(
          "http://13.209.126.231/dummy/status/water_level"
        );
        const waterLevelData = await waterLevelResponse.json();

        const illuminationResponse = await fetch(
          "http://13.209.126.231/dummy/status/illumination"
        );
        const illuminationData = await illuminationResponse.json();

        const tdsResponse = await fetch(
          "http://13.209.126.231/dummy/status/tds"
        );
        const tdsData = await tdsResponse.json();

        const liquidTempResponse = await fetch(
          "http://13.209.126.231/dummy/status/liquid_temp"
        );
        const liquidTempData = await liquidTempResponse.json();

        const predictionResponse = await fetch(
          "http://13.209.126.231/dummy/status/prediction"
        );
        const predictionData = await predictionResponse.json();

        setData({
          tempHumData,
          waterLevelData,
          illuminationData,
          tdsData,
          liquidTempData,
          predictionData,
        });
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    };

    // MQTT 설정
    mqttClient = mqtt.connect({
      host: process.env.REACT_APP_MQTT_HOST,
      port: parseInt(process.env.REACT_APP_MQTT_PORT, 10),
      protocol: process.env.REACT_APP_MQTT_PROTOCOL,
    });

    const handleMqttMessage = (topic, message) => {
      const msg = message.toString();
      // MQTT 메시지 처리 로직
      if (topic === "smartFarm/overview") {
        const receivedData = JSON.parse(msg);
        setData(receivedData);
      } else if (topic === "smartFarm/control/fan") {
        setFan(msg === "1");
      } else if (topic === "smartFarm/control/heater") {
        setHeater(msg === "1");
      } else if (topic === "smartFarm/control/ledLight") {
        setLedLight(msg === "1");
      }
      if (topic === "smartFarm/control/tank1") setTank1(Number(msg));
      if (topic === "smartFarm/control/tank2") setTank2(Number(msg));
      if (topic === "smartFarm/control/tank3") setTank3(Number(msg));
      if (topic === "smartFarm/control/tank4") setTank4(Number(msg));
      if (topic === "smartFarm/control/waterLevel") setWaterLevel(Number(msg));
    };

    // MQTT 연결 설정
    mqttClient.on("connect", () => {
      mqttClient.subscribe("smartFarm/overview");
      mqttClient.subscribe("smartFarm/control/fan");
      mqttClient.subscribe("smartFarm/control/heater");
      mqttClient.subscribe("smartFarm/control/ledLight");
      mqttClient.subscribe("smartFarm/control/tank1");
      mqttClient.subscribe("smartFarm/control/tank2");
      mqttClient.subscribe("smartFarm/control/tank3");
      mqttClient.subscribe("smartFarm/control/tank4");
      mqttClient.subscribe("smartFarm/control/waterLevel");
    });

    mqttClient.on("message", (topic, message) =>
      handleMqttMessage(topic, message)
    );

    fetchData();

    return () => {
      mqttClient.end(); // MQTT 연결 해제
    };
  }, []);

  const toggleFan = () => {
    const newState = !fan;
    setFan(newState);
    mqttClient.publish("smartFarm/control/fan", newState ? "1" : "0");
  };

  const toggleHeater = () => {
    const newState = !heater;
    setHeater(newState);
    mqttClient.publish("smartFarm/control/heater", newState ? "1" : "0");
  };

  const toggleLedLight = () => {
    const newState = !ledLight;
    setLedLight(newState);
    mqttClient.publish("smartFarm/control/ledLight", newState ? "1" : "0");
  };

  const handleTankChange = (tankNumber, value) => {
    if (tankNumber === 1) {
      setTank1(value);
      mqttClient.publish("smartFarm/control/tank1", value.toString());
    } else if (tankNumber === 2) {
      setTank2(value);
      mqttClient.publish("smartFarm/control/tank2", value.toString());
    } else if (tankNumber === 3) {
      setTank3(value);
      mqttClient.publish("smartFarm/control/tank3", value.toString());
    } else if (tankNumber === 4) {
      setTank4(value);
      mqttClient.publish("smartFarm/control/tank4", value.toString());
    }
  };

  const handleWaterLevelChange = (level) => {
    setWaterLevel(level);
    mqttClient.publish("smartFarm/control/waterLevel", level.toString());
  };

  return {
    data,
    fan,
    heater,
    ledLight,
    tank1,
    tank2,
    tank3,
    tank4,
    waterLevel,
    toggleFan,
    toggleHeater,
    toggleLedLight,
    handleTankChange,
    handleWaterLevelChange,
  };
};

export default useSmartFarmData;
