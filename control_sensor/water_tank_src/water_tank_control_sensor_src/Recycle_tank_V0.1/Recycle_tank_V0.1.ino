#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Wi-Fi 정보
const char* ssid = "PLKit";
const char* password = "987654321";

// MQTT 브로커 정보
const char* mqtt_server = "ec2-52-79-219-88.ap-northeast-2.compute.amazonaws.com";

// Soil Moisture Sensor 설정
#define SOIL_MOISTURE_PIN 7   // Soil moisture sensor 연결 핀 (GPIO 5)

// Water Pump 제어 핀 설정 (HG7881 IN1: GPIO 6, IN2: GPIO 16)
const int IN1 = 4;
const int IN2 = 17;

// MQTT 클라이언트 설정
WiFiClient espClient;
PubSubClient client(espClient);

// 메시지 전송 간격 설정 (10초)
const long interval = 10000;  // 센서 데이터 전송 주기 (밀리초)
unsigned long previousMillis = 0;  // 이전 전송 시간 기록

// Wi-Fi 연결 함수
void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }
}

// MQTT 재연결 함수
void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32Client1")) {
      client.subscribe("PLKIT/control/Recycle_fluid", 1);  // Water pump 제어 토픽 구독
    } else {
      delay(5000);  // 연결 실패 시 5초 후 재시도
    }
  }
}

// Water Pump 제어 함수 (MQTT로 받은 명령)
void controlPump(String command) {
  if (command == "on") {
    digitalWrite(IN1, HIGH);  // IN1을 HIGH로 설정
    digitalWrite(IN2, LOW);   // IN2는 LOW로 설정
  } else if (command == "off") {
    digitalWrite(IN1, LOW);   // 펌프 끄기
    digitalWrite(IN2, LOW);
  }
}

// MQTT 메시지 수신 콜백 함수
void callback(char* topic, byte* payload, unsigned int length) {
  char message[length + 1];
  for (int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
  }
  message[length] = '\0';  // 문자열 종료

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (!error) {
    String command = doc["command"].as<String>();
    controlPump(command);  // 워터 펌프 제어
  }
}

// 센서 데이터 전송 함수
void publishSensorData() {
  int soilMoistureValue = analogRead(SOIL_MOISTURE_PIN);
  int soilMoisturePercent = map(soilMoistureValue, 0, 4095, 0, 100);  // 센서 값을 퍼센트로 변환

  StaticJsonDocument<200> jsonDoc;
  jsonDoc["soil_moisture"] = soilMoisturePercent;

  char jsonBuffer[200];
  serializeJson(jsonDoc, jsonBuffer);

  client.publish("PLKIT/sensor/Soil_Moisture/02", jsonBuffer, true);  // 센서 데이터를 MQTT로 전송
}

void setup() {
  pinMode(SOIL_MOISTURE_PIN, INPUT);  // 센서 핀 설정
  pinMode(IN1, OUTPUT);  // 펌프 제어 핀 설정
  pinMode(IN2, OUTPUT);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);  // 펌프 초기 상태는 OFF

  Serial.begin(115200);
  setup_wifi();  // Wi-Fi 연결 설정
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);  // MQTT 콜백 함수 설정
}

void loop() {
  if (!client.connected()) {
    reconnect();  // MQTT 서버에 재연결 시도
  }
  client.loop();  // MQTT 메시지 수신 및 처리

  // 주기적으로 센서 데이터 전송
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    publishSensorData();  // 센서 데이터를 MQTT로 전송
  }
}
