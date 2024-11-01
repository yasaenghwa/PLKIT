#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEClient.h>
#include <BLEScan.h>

// Water Level Sensor 설정
#define WATER_LEVEL_PIN 7  // Water level sensor 연결 핀 (GPIO 7)

// Water Pump 제어 핀 설정 (HG7881 IN1: GPIO 4, IN2: GPIO 17)
const int IN1 = 4;
const int IN2 = 17;

// BLE 설정
#define SERVICE_UUID        "736D6172-7462-6F61-7264-5F706C6B6974"
#define CHARACTERISTIC_UUID_SSID  "5F706C6B-6974-5F77-6966-695F6E616D65"
#define CHARACTERISTIC_UUID_PASS  "5F5F706C-6B69-745F-7061-7373776F7264"
#define CHARACTERISTIC_UUID_MQTT  "5F5F706D-7174-745F-7365-727665725F49"

// BLE 관련 변수들
static BLEAddress *pServerAddress = nullptr;
bool doConnect = false;
BLEClient* pClient = nullptr;
String ssid = "";
String password = "";
String mqttServer = "";  // MQTT 서버 IP

// MQTT 클라이언트 설정
WiFiClient espClient;
PubSubClient client(espClient);

// 데이터 전송 간격 설정 (30초)
const long interval = 30000;
unsigned long previousMillis = 0;  // 이전 전송 시간 기록

// Wi-Fi 연결 함수
void connectToWiFi(const char* ssid, const char* password) {
  Serial.println("Wi-Fi 연결 중...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi 연결 완료!");
  Serial.print("IP 주소: ");
  Serial.println(WiFi.localIP());
}

// MQTT 재연결 함수
void reconnect() {
  while (!client.connected()) {
    Serial.print("MQTT 연결 시도 중...");
    if (client.connect("ESP32Client")) {
      Serial.println("MQTT 연결 성공");
      client.subscribe("PLKIT/control/Recycle_pump", 1);  // 워터 펌프 제어 토픽 구독
    } else {
      Serial.print("MQTT 연결 실패, 상태 코드: ");
      Serial.println(client.state());
      delay(5000);
    }
  }
}

// Water Pump 제어 함수 (MQTT 명령 처리)
void controlPump(String command) {
  if (command == "on") {
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
  } else if (command == "off") {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
  }
}

// MQTT 메시지 수신 콜백 함수
void callback(char* topic, byte* payload, unsigned int length) {
  char message[length + 1];
  for (int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
  }
  message[length] = '\0';

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (!error) {
    String command = doc["command"].as<String>();
    controlPump(command);  // 워터 펌프 제어
  }
}

// 센서 데이터 전송 함수
void publishSensorData() {
  int waterLevelValue = analogRead(WATER_LEVEL_PIN);
  int waterLevelPercent = map(waterLevelValue, 0, 4095, 0, 100);

  StaticJsonDocument<200> jsonDoc;
  jsonDoc["water_level"] = waterLevelPercent;

  char jsonBuffer[200];
  serializeJson(jsonDoc, jsonBuffer);
  client.publish("PLKIT/sensor/water_level/04", jsonBuffer, true);
}

// BLE 클라이언트 콜백 클래스
class MyClientCallback : public BLEClientCallbacks {
  void onConnect(BLEClient* pclient) override {
    Serial.println("BLE 서버에 연결됨.");
  }

  void onDisconnect(BLEClient* pclient) override {
    Serial.println("BLE 서버와 연결 끊김.");
  }
};

// BLE 서버와 연결하고 SSID, 비밀번호, MQTT 서버 IP 수신
void connectToServer() {
  pClient = BLEDevice::createClient();
  pClient->setClientCallbacks(new MyClientCallback());

  // 서버에 연결 시도
  pClient->connect(*pServerAddress);
  Serial.println("BLE 서버에 연결 중...");

  // 서비스와 특성 검색
  BLERemoteService* pRemoteService = pClient->getService(SERVICE_UUID);
  if (pRemoteService == nullptr) {
    Serial.println("BLE 서비스 UUID 찾기 실패");
    return;
  }

  // SSID 특성 읽기
  BLERemoteCharacteristic* pSSIDCharacteristic = pRemoteService->getCharacteristic(CHARACTERISTIC_UUID_SSID);
  if (pSSIDCharacteristic == nullptr) {
    Serial.println("SSID 특성 UUID 찾기 실패");
    return;
  }
  ssid = pSSIDCharacteristic->readValue().c_str();
  Serial.println("수신된 SSID: " + ssid);

  // 비밀번호 특성 읽기
  BLERemoteCharacteristic* pPasswordCharacteristic = pRemoteService->getCharacteristic(CHARACTERISTIC_UUID_PASS);
  if (pPasswordCharacteristic == nullptr) {
    Serial.println("비밀번호 특성 UUID 찾기 실패");
    return;
  }
  password = pPasswordCharacteristic->readValue().c_str();
  Serial.println("수신된 비밀번호: " + password);

  // MQTT 서버 IP 특성 읽기
  BLERemoteCharacteristic* pMQTTCharacteristic = pRemoteService->getCharacteristic(CHARACTERISTIC_UUID_MQTT);
  if (pMQTTCharacteristic == nullptr) {
    Serial.println("MQTT 서버 IP 특성 UUID 찾기 실패");
    return;
  }
  mqttServer = pMQTTCharacteristic->readValue().c_str();
  Serial.println("수신된 MQTT 서버 IP: " + mqttServer);

  // BLE 연결 끊기
  pClient->disconnect();
}

// BLE 광고된 장치 콜백 클래스
class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    Serial.print("광고된 장치 발견: ");
    Serial.println(advertisedDevice.toString().c_str());

    if (advertisedDevice.haveServiceUUID() && advertisedDevice.getServiceUUID().equals(BLEUUID(SERVICE_UUID))) {
      Serial.println("일치하는 BLE 서버 발견");
      pServerAddress = new BLEAddress(advertisedDevice.getAddress());
      advertisedDevice.getScan()->stop();
      doConnect = true;
    }
  }
};

void setup() {
  Serial.begin(115200);
  Serial.println("BLE 스캔 시작...");

  // 센서 및 펌프 핀 설정
  pinMode(WATER_LEVEL_PIN, INPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);

  BLEDevice::init("");

  // BLE 스캔 설정 및 시작
  BLEScan* pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true);
  pBLEScan->start(360);
}

void loop() {
  // BLE 서버 연결
  if (doConnect) {
    connectToServer();
    doConnect = false;

    if (ssid != "" && password != "") {
      connectToWiFi(ssid.c_str(), password.c_str());
      client.setServer(mqttServer.c_str(), 1883);
      client.setCallback(callback);
    }
  }

  if (WiFi.status() == WL_CONNECTED && !client.connected()) {
    reconnect();
  }

  client.loop();

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    publishSensorData();
  }
}
