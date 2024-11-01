#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEClient.h>
#include <BLEScan.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// DS18B20 수온 센서 설정
#define ONE_WIRE_BUS 17  // GPIO 17에 DS18B20 연결
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature waterTempSensor(&oneWire);

// BLE 설정 (송신자에 맞춰 UUID 변경)
#define SERVICE_UUID           "736D6172-7462-6F61-7264-5F706C6B6974"
#define SSID_CHARACTERISTIC_UUID "5F706C6B-6974-5F77-6966-695F6E616D65"
#define PASSWORD_CHARACTERISTIC_UUID "5F5F706C-6B69-745F-7061-7373776F7264"
#define MQTT_CHARACTERISTIC_UUID "5F5F706D-7174-745F-7365-727665725F49" // MQTT 서버 IP 특성 UUID

static BLEAddress *pServerAddress = nullptr;
bool doConnect = false;
bool connected = false;
BLEClient* pClient = nullptr;
String ssid = "";       // Wi-Fi SSID
String password = "";   // Wi-Fi Password
String mqttServerIP = "";   // MQTT 서버 IP

// WiFi 및 MQTT 클라이언트 초기화
WiFiClient espClient;
PubSubClient client(espClient);

// 메시지 전송 간격 설정 (30초)
const long interval = 30000; // 전송 주기 (밀리초)
unsigned long previousMillis = 0; // 이전 전송 시간 기록

// 클라이언트 콜백 클래스
class MyClientCallback : public BLEClientCallbacks {
  void onConnect(BLEClient* pclient) {
    connected = true;
    Serial.println("Connected to BLE server.");
  }

  void onDisconnect(BLEClient* pclient) {
    connected = false;
    Serial.println("Disconnected from BLE server.");
  }
};

// 광고된 장치 콜백 클래스 (서버 발견 시 호출)
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

// 서버에 연결하여 Wi-Fi 및 MQTT 서버 정보 수신
void connectToServer() {
  pClient = BLEDevice::createClient();
  pClient->setClientCallbacks(new MyClientCallback());

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

// Wi-Fi 연결 시도
void connectToWiFi(const char* ssid, const char* password) {
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);

  // Wi-Fi 연결 상태 체크
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // 연결 성공 시 IP 출력
  Serial.println("\nWi-Fi connected successfully!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

// MQTT 재연결 함수
void reconnect() 
{
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {  // Unique client ID for ESP32
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);  // Baud rate 설정
  Serial.println("Starting BLE scan...");

  // DS18B20 수온 센서 시작
  waterTempSensor.begin();

  BLEDevice::init("");

  // BLE 스캔 설정 및 시작
  BLEScan* pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true);
  pBLEScan->start(360);  

  Serial.println("Scanning for BLE devices...");
}

void loop() {
  // BLE 서버를 찾았고 연결할 준비가 되었으면 연결 시도
  if (doConnect) {
    connectToServer();
    doConnect = false;

    // Wi-Fi 연결 시도
    if (ssid != "" && password != "") {
      connectToWiFi(ssid.c_str(), password.c_str());

      // MQTT 서버 설정
      if (mqttServerIP != "") {
        client.setServer(mqttServerIP.c_str(), 1883);
      }
      client.setKeepAlive(120); // Keep-Alive 설정을 120초로 증가
    }
  }

  if (WiFi.status() == WL_CONNECTED && !client.connected()) {
    reconnect();  // MQTT 재연결
  }

  client.loop();

  unsigned long currentMillis = millis();
  
  // 메시지 전송 주기 체크
  if (currentMillis - previousMillis >= interval && WiFi.status() == WL_CONNECTED) {
    previousMillis = currentMillis;

    // DS18B20 수온 읽기
    waterTempSensor.requestTemperatures();
    float waterTemperature = waterTempSensor.getTempCByIndex(0);

    // -127.0이면 센서로부터 데이터를 읽을 수 없음을 의미
    if (waterTemperature == -127.0) {
      Serial.println("Failed to read water temperature. Check the sensor connection.");
      return;
    }

    // 데이터 출력
    Serial.print("Water Temperature: ");
    Serial.println(waterTemperature);

    // JSON 객체 생성
    StaticJsonDocument<200> jsonDoc;
    jsonDoc["water_temperature"] = waterTemperature;

    char jsonBuffer[200];
    serializeJson(jsonDoc, jsonBuffer);

    Serial.print("Publishing JSON message: ");
    Serial.println(jsonBuffer);

    // JSON 메시지 전송
    if (client.publish("PLKIT/sensor/Water_Temperature/01", jsonBuffer, true)) {
      Serial.println("JSON message published successfully");
    } else {
      Serial.println("Failed to publish JSON message");
    }
  }
}
