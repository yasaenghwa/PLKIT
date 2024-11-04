#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID           "736D6172-7462-6F61-7264-5F706C6B6974"  // Service UUID
#define CHARACTERISTIC_UUID_SSID  "5F706C6B-6974-5F77-6966-695F6E616D65"  // SSID Characteristic UUID
#define CHARACTERISTIC_UUID_PASS  "5F5F706C-6B69-745F-7061-7373776F7264"  // Password Characteristic UUID
#define CHARACTERISTIC_UUID_MQTT  "5F5F706D-7174-745F-7365-727665725F49"  // MQTT 서버 IP 특성 UUID

BLEServer *pServer = nullptr;
bool deviceConnected = false;
unsigned long lastConnectionTime = 0;
const unsigned long connectionDuration = 10000; // 연결 유지 시간 (예: 10초)

class MyServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      lastConnectionTime = millis();  // 연결된 시간 저장
      Serial.println("장치가 연결되었습니다.");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("장치가 연결이 끊겼습니다.");
      pServer->startAdvertising();  // 연결이 끊기면 광고 재개
    }
};

void setup() {
  Serial.begin(115200);

  // BLE 초기화
  BLEDevice::init("ESP32 WiFi and MQTT Advertiser");
  
  // BLE 서버 생성
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());  // 서버 콜백 설정
  
  // 서비스 생성 및 추가
  BLEService *pService = pServer->createService(SERVICE_UUID);
  
  // SSID 특성 생성 및 값 설정
  BLECharacteristic *pCharacteristicSSID = pService->createCharacteristic(
                                          CHARACTERISTIC_UUID_SSID,
                                          BLECharacteristic::PROPERTY_READ |
                                          BLECharacteristic::PROPERTY_NOTIFY
                                        );
  pCharacteristicSSID->setValue("PLkit");
  
  // 비밀번호 특성 생성 및 값 설정
  BLECharacteristic *pCharacteristicPass = pService->createCharacteristic(
                                          CHARACTERISTIC_UUID_PASS,
                                          BLECharacteristic::PROPERTY_READ |
                                          BLECharacteristic::PROPERTY_NOTIFY
                                        );
  pCharacteristicPass->setValue("987654321");
  
  // MQTT 서버 IP 특성 생성 및 값 설정
  BLECharacteristic *pCharacteristicMQTT = pService->createCharacteristic(
                                          CHARACTERISTIC_UUID_MQTT,
                                          BLECharacteristic::PROPERTY_READ |
                                          BLECharacteristic::PROPERTY_NOTIFY
                                        );
  pCharacteristicMQTT->setValue("192.168.1.5");

  // 서비스 시작
  pService->start();
  
  // BLE 광고 시작
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);  // 서비스 UUID를 광고에 추가
  pAdvertising->setScanResponse(true);  // 스캔 응답 활성화
  pAdvertising->setMinPreferred(0x06);  // 최소 광고 간격 설정
  pAdvertising->setMinPreferred(0x12);
  pAdvertising->start();  // 광고 시작
  
  Serial.println("BLE WiFi 및 MQTT 정보 광고 시작...");
}

void loop() {
  // 연결 상태 확인 및 자동 연결 종료
  if (deviceConnected && (millis() - lastConnectionTime > connectionDuration)) {
    pServer->disconnect(0);  // 10초 후 연결 해제
  }
  delay(1000);
}
