#include "esp_camera.h"   // ESP32 카메라 라이브러리 추가
#include <WiFi.h>
#include <WebSocketsClient.h>
#include "ipconfig.h"  // 보안 데이터 처리 헤더 파일

// 카메라 모델 선택 (ESP32-S3-WROOM-1 + OV2640)
#define CAMERA_MODEL_ESP32S3_EYE // Has PSRAM
#include "camera_pins.h"

// Wi-Fi 설정


// WebSocket 설정
WebSocketsClient webSocket;

void cameraInit(void);
void sendVideoFrame();
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length);

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  // 카메라 초기화
  cameraInit();
  
  // Wi-Fi 연결
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  // WebSocket 연결
  webSocket.begin(websocket_server_host, websocket_server_port, websocket_server_path);
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  // WebSocket 이벤트 처리
  webSocket.loop();

  // 카메라 프레임 캡처 및 전송
  sendVideoFrame();
  delay(30);  // 프레임 전송 속도 조절 (약 33fps)
}

// 카메라 초기화 함수
void cameraInit(void) {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  if (psramFound()) {
    config.jpeg_quality = 10;
    config.fb_count = 2;
    config.grab_mode = CAMERA_GRAB_LATEST;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.fb_location = CAMERA_FB_IN_DRAM;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  sensor_t * s = esp_camera_sensor_get();
  s->set_vflip(s, 1);    // 이미지 뒤집기
  s->set_brightness(s, 1);  // 밝기 조정
  s->set_saturation(s, 0);  // 채도 조정
}

// 비디오 프레임을 WebSocket으로 전송하는 함수
void sendVideoFrame() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  // WebSocket을 통해 비디오 프레임 전송
  webSocket.sendBIN(fb->buf, fb->len);

  // 프레임 반환
  esp_camera_fb_return(fb);
}

// WebSocket 이벤트 핸들러
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      break;
    case WStype_CONNECTED:
      Serial.println("WebSocket Connected");
      break;
    case WStype_TEXT:
      Serial.printf("WebSocket Text Message: %s\n", payload);
      break;
    case WStype_BIN:
      Serial.println("WebSocket Binary Message Received");
      break;
    default:
      break;
  }
}
