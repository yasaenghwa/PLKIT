#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEClient.h>
#include <BLEScan.h>

// 릴레이 제어 핀 설정
const int ledRelayPin = 15;  // LED 릴레이 핀 (GPIO 6)
const int fanRelayPin = 3;  

// BLE 설정
#define SERVICE_UUID           "736D6172-7462-6F61-7264-5F706C6B6974"  // Service UUID
#define CHARACTERISTIC_UUID_SSID  "5F706C6B-6974-5F77-6966-695F6E616D65"  // SSID Characteristic UUID
#define CHARACTERISTIC_UUID_PASS  "5F5F706C-6B69-745F-7061-7373776F7264"  // Password Characteristic UUID
#define CHARACTERISTIC_UUID_MQTT  "5F5F706D-7174-745F-7365-727665725F49"  // MQTT 서버 IP 특성 UUID

static BLEAddress *pServerAddress = nullptr;
bool doConnect = false;
BLEClient* pClient = nullptr;
String ssid = "";
String password = "";
String mqttServer = "";  // MQTT 서버 IP

// WiFi 및 MQTT 클라이언트 설정
WiFiClient espClient;
PubSubClient client(espClient);

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
    // Serial.print("Attempting MQTT connection..."); // 이 부분을 제거
    if (client.connect("ESP32Client")) {
      // 각 제어 토픽 구독
      client.subscribe("PLKIT/control/Light", 1);  // LED 제어 토픽
      client.subscribe("PLKIT/control/fan", 1);  // Fan 제어 토픽
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 2 seconds");
      delay(2000);
    }
  }
}

// LED 제어 함수
void controlLED(String command) {
  if (command == "on") {
    digitalWrite(ledRelayPin, HIGH);  // 릴레이 활성화, LED 켜짐
    Serial.println("LED turned ON");
  } else if (command == "off") {
    digitalWrite(ledRelayPin, LOW);   // 릴레이 비활성화, LED 꺼짐
    Serial.println("LED turned OFF");
  }
}

// Fan 제어 함수
void controlFan(String command) {
  if (command == "on") {
    digitalWrite(fanRelayPin, HIGH);  // 릴레이 활성화, Fan 켜짐
    Serial.println("Fan turned ON");
  } else if (command == "off") {
    digitalWrite(fanRelayPin, LOW);   // 릴레이 비활성화, Fan 꺼짐
    Serial.println("Fan turned OFF");
  }
}

// MQTT 메시지 수신 콜백 함수 (JSON 파싱 포함)
void callback(char* topic, byte* payload, unsigned int length) {
  char message[length + 1];
  for (int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
  }
  message[length] = '\0';  // 문자열 종료

  // JSON 파싱
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (!error) {
    String command = doc["command"].as<String>();

    // 해당 토픽에 따라 제어
    if (String(topic) == "PLKIT/control/Light") {
      controlLED(command);  // LED 제어
    } else if (String(topic) == "PLKIT/control/fan") {
      controlFan(command);  // Fan 제어
    }
  } else {
    Serial.println("Failed to parse JSON");
  }
}

// BLE 클라이언트 콜백 클래스
class MyClientCallback : public BLEClientCallbacks {
  void onConnect(BLEClient* pclient) override {
    Serial.println("Connected to BLE server.");
  }

  void onDisconnect(BLEClient* pclient) override {
    Serial.println("Disconnected from BLE server.");
  }
};

// 서버에 연결하여 SSID, Password, MQTT 서버 IP 수신
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
  BLERemoteCharacteristic* pSSIDCharacteristic = pRemoteService->getCharacteristic(CHARACTERISTIC_UUID_SSID);
  if (pSSIDCharacteristic == nullptr) {
    Serial.println("Failed to find SSID characteristic UUID");
    return;
  }
  ssid = pSSIDCharacteristic->readValue().c_str();
  Serial.println("Received SSID: " + ssid);

  // Password 특성 읽기
  BLERemoteCharacteristic* pPasswordCharacteristic = pRemoteService->getCharacteristic(CHARACTERISTIC_UUID_PASS);
  if (pPasswordCharacteristic == nullptr) {
    Serial.println("Failed to find Password characteristic UUID");
    return;
  }
  password = pPasswordCharacteristic->readValue().c_str();
  Serial.println("Received Password: " + password);

  // MQTT 서버 IP 특성 읽기
  BLERemoteCharacteristic* pMQTTCharacteristic = pRemoteService->getCharacteristic(CHARACTERISTIC_UUID_MQTT);
  if (pMQTTCharacteristic == nullptr) {
    Serial.println("Failed to find MQTT Server IP characteristic UUID");
    return;
  }
  mqttServer = pMQTTCharacteristic->readValue().c_str();
  Serial.println("Received MQTT Server IP: " + mqttServer);

  // BLE 연결 끊기
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

  // 릴레이 핀 설정
  pinMode(ledRelayPin, OUTPUT);
  digitalWrite(ledRelayPin, LOW);  // LED 초기 상태는 OFF

  pinMode(fanRelayPin, OUTPUT);
  digitalWrite(fanRelayPin, LOW);  // Fan 초기 상태는 OFF

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
    if (ssid != "" && password != "") {
      connectToWiFi(ssid.c_str(), password.c_str());
      client.setServer(mqttServer.c_str(), 1883);  // BLE로 수신한 MQTT 서버 설정
      client.setCallback(callback);  // MQTT 콜백 함수 설정
    }
  }

  if (WiFi.status() == WL_CONNECTED && !client.connected()) {
    reconnect();  // MQTT 서버에 재연결 시도
  }

  client.loop();  // MQTT 메시지 수신 및 처리
}
