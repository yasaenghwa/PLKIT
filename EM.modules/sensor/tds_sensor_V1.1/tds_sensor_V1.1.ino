#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEClient.h>
#include <BLEScan.h>

// TDS 센서 설정
#define TdsSensorPin 5  
#define VREF 3.3        
#define SCOUNT  30      
int analogBuffer[SCOUNT];  
int analogBufferTemp[SCOUNT];
int analogBufferIndex = 0, copyIndex = 0;
float averageVoltage = 0, tdsValue = 0, temperature = 25;

// BLE 설정
#define SERVICE_UUID           "736D6172-7462-6F61-7264-5F706C6B6974"
#define SSID_CHARACTERISTIC_UUID   "5F706C6B-6974-5F77-6966-695F6E616D65"
#define PASSWORD_CHARACTERISTIC_UUID   "5F5F706C-6B69-745F-7061-7373776F7264"
#define MQTT_CHARACTERISTIC_UUID   "5F5F706D-7174-745F-7365-727665725F49"  // MQTT 서버 IP 특성 UUID

static BLEAddress *pServerAddress = nullptr;
bool doConnect = false;
bool connected = false;
BLEClient* pClient = nullptr;
String ssid = "";      
String password = "";  
String mqttServerIP = "";  // MQTT 서버 IP

// WiFi 및 MQTT 클라이언트 초기화
WiFiClient espClient;
PubSubClient client(espClient);

const long mqttInterval = 10000; 
unsigned long previousMillis = 0;

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
      advertisedDevice.getScan()->stop();  
      doConnect = true;  
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
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {
      Serial.println("MQTT connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BLE scan...");

  BLEDevice::init("");

  // BLE 스캔 설정 및 시작
  BLEScan* pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true);
  pBLEScan->start(360); 

  pinMode(TdsSensorPin, INPUT);  // TDS 센서 핀 설정
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
      client.setKeepAlive(120);  // Keep-Alive 설정
    }
  }

  if (WiFi.status() == WL_CONNECTED && !client.connected()) {
    reconnect();  
  }

  client.loop();

  static unsigned long analogSampleTimepoint = millis();
  if (millis() - analogSampleTimepoint > 40U) {
    analogSampleTimepoint = millis();
    analogBuffer[analogBufferIndex] = analogRead(TdsSensorPin);
    analogBufferIndex++;
    if (analogBufferIndex == SCOUNT) analogBufferIndex = 0;
  }

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= mqttInterval && WiFi.status() == WL_CONNECTED) {
    previousMillis = currentMillis;

    for (copyIndex = 0; copyIndex < SCOUNT; copyIndex++)
      analogBufferTemp[copyIndex] = analogBuffer[copyIndex];
    
    averageVoltage = getMedianNum(analogBufferTemp, SCOUNT) * VREF / 4095.0;
    float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0);
    float compensationVoltage = averageVoltage / compensationCoefficient;
    tdsValue = (133.42 * compensationVoltage * compensationVoltage * compensationVoltage 
              - 255.86 * compensationVoltage * compensationVoltage 
              + 857.39 * compensationVoltage) * 0.5;

    // JSON 객체 생성
    StaticJsonDocument<200> jsonDoc;
    jsonDoc["tds"] = tdsValue; 

    // JSON 데이터를 문자열로 변환
    char jsonBuffer[200];
    serializeJson(jsonDoc, jsonBuffer);

    // MQTT로 JSON 메시지 전송
    Serial.print("Publishing JSON message: ");
    Serial.println(jsonBuffer);

    if (client.publish("PLKIT/sensor/TDS", jsonBuffer, true)) {
      Serial.println("JSON message published successfully");
    } else {
      Serial.println("Failed to publish JSON message");
    }
  }
  
  delay(100);  // 100ms 대기
}

// 중간값 필터링 함수
int getMedianNum(int bArray[], int iFilterLen) {
  int bTab[iFilterLen];
  for (byte i = 0; i < iFilterLen; i++)
    bTab[i] = bArray[i];

  int i, j, bTemp;
  
  for (j = 0; j < iFilterLen - 1; j++) {
    for (i = 0; i < iFilterLen - j - 1; i++) {
      if (bTab[i] > bTab[i + 1]) {
        bTemp = bTab[i];
        bTab[i] = bTab[i + 1];
        bTab[i + 1] = bTemp;
      }
    }
  }

  if ((iFilterLen & 1) > 0)
    bTemp = bTab[(iFilterLen - 1) / 2];
  else
    bTemp = (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
  
  return bTemp;
}
