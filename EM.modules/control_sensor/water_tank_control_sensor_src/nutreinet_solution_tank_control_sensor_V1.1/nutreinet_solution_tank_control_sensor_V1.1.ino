#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEClient.h>
#include <BLEScan.h>

// Water Level Sensor 설정
#define WATER_LEVEL_PIN 6  // Water level sensor 연결 핀 (GPIO 6)

// Water Pump 제어 핀 설정 (HG7881 IN1: GPIO 17, IN2: GPIO 11)
const int IN1 = 17;
const int IN2 = 11;

// BLE 설정
#define SERVICE_UUID           "736D6172-7462-6F61-7264-5F706C6B6974"
#define SSID_CHARACTERISTIC_UUID  "5F706C6B-6974-5F77-6966-695F6E616D65"
#define PASSWORD_CHARACTERISTIC_UUID  "5F5F706C-6B69-745F-7061-7373776F7264"
#define MQTT_CHARACTERISTIC_UUID  "5F5F706D-7174-745F-7365-727665725F49"  // MQTT 서버 IP 특성 UUID

static BLEAddress *pServerAddress = nullptr;
bool doConnect = false;
BLEClient* pClient = nullptr;
String ssid = "";      
String password = "";  
String mqttServerIP = "";  // MQTT 서버 IP

// MQTT 클라이언트 설정
WiFiClient espClient;
PubSubClient client(espClient);

// 메시지 전송 간격 설정 (10초)
const long interval = 10000;  // 센서 데이터 전송 주기 (밀리초)
unsigned long previousMillis = 0;  // 이전 전송 시간 기록

// Wi-Fi 연결 함수
void connectToWiFi(const char* ssid, const char* password) {
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi connected successfully!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

// MQTT 재연결 함수
void reconnect() {
  while (!client.connected()) {
    //Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {
      //Serial.println("connected");
      client.subscribe("PLKIT/control/nutreinet_solution_pump", 1);  // Water pump 제어 토픽 구독
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
  int waterLevelValue = analogRead(WATER_LEVEL_PIN);
  int waterLevelPercent = map(waterLevelValue, 0, 4095, 0, 100);  // 센서 값을 퍼센트로 변환

  StaticJsonDocument<200> jsonDoc;
  jsonDoc["water_level"] = waterLevelPercent;

  char jsonBuffer[200];
  serializeJson(jsonDoc, jsonBuffer);

  client.publish("PLKIT/sensor/water_level/01", jsonBuffer, true);  // 센서 데이터를 MQTT로 전송
}

// BLE 클라이언트 콜백 클래스 (onConnect, onDisconnect 함수 구현)
class MyClientCallback : public BLEClientCallbacks {
  void onConnect(BLEClient* pclient) override {
    Serial.println("Connected to BLE server.");
  }

  void onDisconnect(BLEClient* pclient) override {
    Serial.println("Disconnected from BLE server.");
  }
};

// 서버에 연결하여 두 값을 수신 (BLE)
void connectToServer() {
  pClient = BLEDevice::createClient();
  pClient->setClientCallbacks(new MyClientCallback());  // 콜백 설정

  // 서버에 연결 시도
  pClient->connect(*pServerAddress);
  Serial.println("Connecting to BLE server...");

  // 서비스와 특성 검색
  BLERemoteService* pRemoteService = pClient->getService(SERVICE_UUID);
  if (pRemoteService == nullptr) {
    Serial.println("Failed to find BLE service UUID");
    return;
  }

  // SSID 특성 읽기
  BLERemoteCharacteristic* pSSIDCharacteristic = pRemoteService->getCharacteristic(SSID_CHARACTERISTIC_UUID);
  if (pSSIDCharacteristic == nullptr) {
    Serial.println("Failed to find SSID characteristic UUID");
    return;
  }
  ssid = pSSIDCharacteristic->readValue().c_str();
  Serial.println("Received SSID: " + ssid);

  // Password 특성 읽기
  BLERemoteCharacteristic* pPasswordCharacteristic = pRemoteService->getCharacteristic(PASSWORD_CHARACTERISTIC_UUID);
  if (pPasswordCharacteristic == nullptr) {
    Serial.println("Failed to find Password characteristic UUID");
    return;
  }
  password = pPasswordCharacteristic->readValue().c_str();
  Serial.println("Received Password: " + password);

  // MQTT 서버 IP 특성 읽기
  BLERemoteCharacteristic* pMQTTCharacteristic = pRemoteService->getCharacteristic(MQTT_CHARACTERISTIC_UUID);
  if (pMQTTCharacteristic == nullptr) {
    Serial.println("Failed to find MQTT Server IP characteristic UUID");
    return;
  }
  mqttServerIP = pMQTTCharacteristic->readValue().c_str();
  Serial.println("Received MQTT Server IP: " + mqttServerIP);

  // 값 수신 후 명시적으로 연결 끊기
  pClient->disconnect();
}

// BLE 광고된 장치 콜백 클래스
class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    Serial.print("Advertised Device found: ");
    Serial.println(advertisedDevice.toString().c_str());

    // 서비스 UUID가 매칭되는지 확인
    if (advertisedDevice.haveServiceUUID() && advertisedDevice.getServiceUUID().equals(BLEUUID(SERVICE_UUID))) {
      Serial.println("Found a BLE server with matching UUID.");
      pServerAddress = new BLEAddress(advertisedDevice.getAddress());
      advertisedDevice.getScan()->stop();  // 서버를 찾으면 스캔 중지
      doConnect = true;  // 연결 플래그 설정
    }
  }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BLE scan...");

  // 센서 및 펌프 핀 설정
  pinMode(WATER_LEVEL_PIN, INPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);  // 펌프 초기 상태는 OFF

  BLEDevice::init("");

  // BLE 스캔 설정 및 시작
  BLEScan* pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true);
  pBLEScan->start(360);  
}

void loop() {
  // BLE 서버를 찾았고 연결할 준비가 되었으면 연결 시도
  if (doConnect) {
    connectToServer();
    doConnect = false;

    // Wi-Fi 연결 시도
    if (ssid != "" && password != "" && mqttServerIP != "") {
      connectToWiFi(ssid.c_str(), password.c_str());
      client.setServer(mqttServerIP.c_str(), 1883);  // 수신한 MQTT 서버 IP 설정
      client.setCallback(callback);  // MQTT 콜백 함수 설정
    }
  }

  if (WiFi.status() == WL_CONNECTED && !client.connected()) {
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
