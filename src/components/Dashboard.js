import React, { useState, useEffect } from "react";
import Overview from "./Overview";
import Control from "./Control";
import mqtt from "mqtt"; // mqtt 라이브러리 추가
import styles from "../App/App.module.less"; // CSS를 module 형식으로 변경

const Dashboard = () => {
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

  // 데이터를 서버로부터 불러오는 함수
  const fetchData = async () => {
    try {
      const tempHumResponse = await fetch(
        "http://52.79.219.88/dummy/status/temp_hum"
      );
      const tempHumData = await tempHumResponse.json();

      const waterLevelResponse = await fetch(
        "http://52.79.219.88/dummy/status/water_level"
      );
      const waterLevelData = await waterLevelResponse.json();

      const illuminationResponse = await fetch(
        "http://52.79.219.88/dummy/status/illumination"
      );
      const illuminationData = await illuminationResponse.json();

      const tdsResponse = await fetch("http://52.79.219.88/dummy/status/tds");
      const tdsData = await tdsResponse.json();

      const liquidTempResponse = await fetch(
        "http://52.79.219.88/dummy/status/liquid_temp"
      );
      const liquidTempData = await liquidTempResponse.json();

      const predictionResponse = await fetch(
        "http://52.79.219.88/dummy/status/prediction"
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
  const mqttClient = mqtt.connect({
    host: "52.79.219.88", // 브로커 IP 주소
    port: 9001, // MQTT 브로커의 포트 (일반적으로 1883)
    protocol: "mqtt", // 프로토콜을 명시적으로 'mqtt'로 설정
  });

  // 수신된 메시지를 처리하는 부분 (handleMqttMessage)
  const handleMqttMessage = (topic, message) => {
    const msg = message.toString();

    if (topic === "smartFarm/overview") {
      const receivedData = JSON.parse(msg);
      setData(receivedData);
    } else if (topic === "smartFarm/control/fan") {
      setFan(msg === "1"); // 메시지가 1이면 팬을 켬
    } else if (topic === "smartFarm/control/heater") {
      setHeater(msg === "1"); // 메시지가 1이면 히터를 켬
    } else if (topic === "smartFarm/control/ledLight") {
      setLedLight(msg === "1"); // 메시지가 1이면 LED를 켬
    }

    // 각 탱크에 대한 MQTT 수신 처리
    if (topic === "smartFarm/control/tank1") {
      setTank1(Number(msg));
    }
    if (topic === "smartFarm/control/tank2") {
      setTank2(Number(msg));
    }
    if (topic === "smartFarm/control/tank3") {
      setTank3(Number(msg));
    }
    if (topic === "smartFarm/control/tank4") {
      setTank4(Number(msg));
    }
    if (topic === "smartFarm/control/waterLevel") {
      setWaterLevel(Number(msg));
    }
  };

  useEffect(() => {
    fetchData(); // 데이터를 불러오는 함수가 제대로 작동하는지 확인
    // MQTT 연결 및 주제 구독
    //MQTT 브로커로부터 특정 토픽에 대한 메시지를 수신하기 위함
    mqttClient.on("connect", () => {
      console.log("MQTT Broker에 연결됨");
      mqttClient.subscribe("smartFarm/overview", (err) => {
        if (!err) {
          console.log("smartFarm/overview 구독됨");
        }
      });

      mqttClient.subscribe("smartFarm/control/fan", (err) => {
        if (!err) {
          console.log("smartFarm/control/fan 구독됨");
        }
      });

      mqttClient.subscribe("smartFarm/control/heater", (err) => {
        if (!err) {
          console.log("smartFarm/control/heater 구독됨");
        }
      });

      mqttClient.subscribe("smartFarm/control/ledLight", (err) => {
        if (!err) {
          console.log("smartFarm/control/ledLight 구독됨");
        }
      });
      // 탱크 및 수위 관련 MQTT 주제 구독
      mqttClient.subscribe("smartFarm/control/tank1");
      mqttClient.subscribe("smartFarm/control/tank2");
      mqttClient.subscribe("smartFarm/control/tank3");
      mqttClient.subscribe("smartFarm/control/tank4");
      mqttClient.subscribe("smartFarm/control/waterLevel");
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT Broker 연결 실패:", err);
    });

    mqttClient.on("message", (topic, message) => {
      console.log(`주제 ${topic}에서 메시지 수신: ${message.toString()}`);
      handleMqttMessage(topic, message);
    });

    // 컴포넌트 언마운트 시 MQTT 연결 해제
    return () => {
      mqttClient.end();
    };
  }, []);

  // 물탱크 수위, 팬, 히터 등의 상태 변화를 MQTT를 통해 전송

  const toggleFan = () => {
    const newState = !fan;
    setFan(newState);
    console.log("Fan state:", newState); // 팬 상태 로그
    mqttClient.publish("smartFarm/control/fan", newState ? "1" : "0");
  };

  const toggleHeater = () => {
    const newState = !heater;
    setHeater(newState);
    console.log("Heater:", newState); // 팬 상태 로그
    mqttClient.publish("smartFarm/control/heater", newState ? "1" : "0");
  };

  const toggleLedLight = () => {
    const newState = !ledLight;
    setLedLight(newState);
    console.log("Led Light:", newState); // 팬 상태 로그
    mqttClient.publish("smartFarm/control/ledLight", newState ? "1" : "0");
  };

  const handleTankChange = (tankNumber, value) => {
    if (tankNumber === 1) {
      setTank1(value);
      console.log("Tank 1 level:", value); // tank1 상태 로그
      mqttClient.publish("smartFarm/control/tank1", value.toString());
    } else if (tankNumber === 2) {
      setTank2(value);
      console.log("Tank 2 level:", value); // tank2 상태 로그
      mqttClient.publish("smartFarm/control/tank2", value.toString());
    } else if (tankNumber === 3) {
      setTank3(value);
      console.log("Tank 3 level:", value); // tank3 상태 로그
      mqttClient.publish("smartFarm/control/tank3", value.toString());
    } else if (tankNumber === 4) {
      setTank4(value);
      console.log("Tank 4 level:", value); // tank4 상태 로그
      mqttClient.publish("smartFarm/control/tank4", value.toString());
    }
  };

  const handleWaterLevelChange = (level) => {
    setWaterLevel(level);
    console.log("Water Level:", level); // water level 상태 로그
    mqttClient.publish("smartFarm/control/waterLevel", level.toString());
  };

  if (
    !data.tempHumData ||
    !data.waterLevelData ||
    !data.illuminationData ||
    !data.tdsData ||
    !data.liquidTempData ||
    !data.predictionData
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Overview data={data} />
      <Control
        fan={fan}
        setFan={toggleFan} // MQTT 통신을 위한 함수로 변경
        heater={heater}
        setHeater={toggleHeater} // MQTT 통신을 위한 함수로 변경
        ledLight={ledLight}
        setLedLight={toggleLedLight} // MQTT 통신을 위한 함수로 변경
        tank1={tank1}
        setTank1={(value) => handleTankChange(1, value)} // 탱크 상태 변경 핸들러 적용
        tank2={tank2}
        setTank2={(value) => handleTankChange(2, value)}
        tank3={tank3}
        setTank3={(value) => handleTankChange(3, value)}
        tank4={tank4}
        setTank4={(value) => handleTankChange(4, value)}
        waterLevel={waterLevel}
        handleWaterLevelChange={handleWaterLevelChange}
      />
    </div>
  );
};

export default Dashboard;
