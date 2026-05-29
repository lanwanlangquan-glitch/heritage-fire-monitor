/*
  Ancient Building Fire Monitor - ESP32 V1
  Sensors:
    - SHT31 temperature/humidity sensor on I2C
    - DS18B20 cable temperature probe on GPIO4
    - MQ-2 smoke/gas analog output on GPIO34
  Outputs:
    - Red LED on GPIO26
    - Green LED on GPIO27
    - Active buzzer on GPIO25

  Libraries to install in Arduino IDE:
    - Adafruit SHT31 Library
    - Adafruit BusIO
    - OneWire
    - DallasTemperature
*/

#include <Wire.h>
#include <Adafruit_SHT31.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Wi-Fi and cloud backend.
// Change these two values before uploading the sketch to your ESP32.
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Tencent Cloud backend endpoint.
const char* SERVER_URL = "http://81.70.232.233:3000/api/sensor-data";
const char* DEVICE_ID = "D-A01";

// Pin mapping
const int DS18B20_PIN = 4;
const int MQ2_PIN = 34;
const int BUZZER_PIN = 25;
const int RED_LED_PIN = 26;
const int GREEN_LED_PIN = 27;

// Alarm thresholds. Tune these after observing your real sensor values.
const float ENV_TEMP_WARN_C = 45.0;
const float CABLE_TEMP_WARN_C = 55.0;
const float CABLE_TEMP_DANGER_C = 65.0;
const float HUMIDITY_DRY_WARN = 30.0;
const int MQ2_WARN_RAW = 1800;
const int MQ2_DANGER_RAW = 2600;

const unsigned long SAMPLE_INTERVAL_MS = 2000;
const unsigned long UPLOAD_INTERVAL_MS = 5000;
const unsigned long BUZZER_TOGGLE_MS = 300;

Adafruit_SHT31 sht31 = Adafruit_SHT31();
OneWire oneWire(DS18B20_PIN);
DallasTemperature ds18b20(&oneWire);

unsigned long lastSampleMs = 0;
unsigned long lastUploadMs = 0;
unsigned long lastBuzzerToggleMs = 0;
bool buzzerState = false;
bool alarmActive = false;

struct SensorData {
  float envTempC;
  float humidity;
  float cableTempC;
  int smokeRaw;
  int riskScore;
  bool sht31Ok;
  bool ds18b20Ok;
};

void connectWiFi();
SensorData readSensors();
int calculateRiskScore(const SensorData &data);
void updateLedState(int riskScore);
void updateBuzzer();
void printSensorData(const SensorData &data);
void appendJsonNumber(String &json, const char* key, float value, int decimals, bool &hasPrevious);
void appendJsonInt(String &json, const char* key, int value, bool &hasPrevious);
String buildSensorPayload(const SensorData &data);
void uploadSensorData(const SensorData &data);

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(MQ2_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);

  Wire.begin(21, 22);

  Serial.println();
  Serial.println("ESP32 Ancient Building Fire Monitor V1 starting...");

  if (!sht31.begin(0x44)) {
    Serial.println("SHT31 not found at address 0x44. Check SDA/SCL/VCC/GND.");
  } else {
    Serial.println("SHT31 ready.");
  }

  ds18b20.begin();
  Serial.print("DS18B20 device count: ");
  Serial.println(ds18b20.getDeviceCount());

  Serial.println("MQ-2 needs warm-up. First readings may drift for several minutes.");

  connectWiFi();
}

void loop() {
  unsigned long now = millis();

  if (now - lastSampleMs >= SAMPLE_INTERVAL_MS) {
    lastSampleMs = now;

    SensorData data = readSensors();
    data.riskScore = calculateRiskScore(data);
    alarmActive = data.riskScore >= 60;

    updateLedState(data.riskScore);
    printSensorData(data);

    if (now - lastUploadMs >= UPLOAD_INTERVAL_MS) {
      lastUploadMs = now;
      uploadSensorData(data);
    }
  }

  updateBuzzer();
}

void connectWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startMs = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startMs < 15000) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi connected, IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Wi-Fi connection failed. Sensor will keep running and retry uploads later.");
  }
}

SensorData readSensors() {
  SensorData data;

  data.envTempC = sht31.readTemperature();
  data.humidity = sht31.readHumidity();
  data.sht31Ok = !isnan(data.envTempC) && !isnan(data.humidity);

  ds18b20.requestTemperatures();
  data.cableTempC = ds18b20.getTempCByIndex(0);
  data.ds18b20Ok = data.cableTempC > -100.0 && data.cableTempC < 125.0;

  data.smokeRaw = analogRead(MQ2_PIN);
  data.riskScore = 0;

  return data;
}

int calculateRiskScore(const SensorData &data) {
  int score = 0;

  if (!data.sht31Ok) {
    score += 10;
  } else {
    if (data.envTempC >= ENV_TEMP_WARN_C) score += 25;
    if (data.humidity <= HUMIDITY_DRY_WARN) score += 10;
  }

  if (!data.ds18b20Ok) {
    score += 15;
  } else {
    if (data.cableTempC >= CABLE_TEMP_DANGER_C) {
      score += 45;
    } else if (data.cableTempC >= CABLE_TEMP_WARN_C) {
      score += 30;
    }
  }

  if (data.smokeRaw >= MQ2_DANGER_RAW) {
    score += 45;
  } else if (data.smokeRaw >= MQ2_WARN_RAW) {
    score += 30;
  }

  if (data.ds18b20Ok && data.sht31Ok && data.cableTempC - data.envTempC >= 20.0) {
    score += 15;
  }

  if (score > 100) score = 100;
  return score;
}

void updateLedState(int riskScore) {
  if (riskScore >= 60) {
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, LOW);
  } else if (riskScore >= 30) {
    digitalWrite(RED_LED_PIN, millis() / 500 % 2);
    digitalWrite(GREEN_LED_PIN, LOW);
  } else {
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, HIGH);
  }
}

void updateBuzzer() {
  if (!alarmActive) {
    buzzerState = false;
    digitalWrite(BUZZER_PIN, LOW);
    return;
  }

  unsigned long now = millis();
  if (now - lastBuzzerToggleMs >= BUZZER_TOGGLE_MS) {
    lastBuzzerToggleMs = now;
    buzzerState = !buzzerState;
    digitalWrite(BUZZER_PIN, buzzerState ? HIGH : LOW);
  }
}

void printSensorData(const SensorData &data) {
  Serial.println("--------------------------------------------------");

  Serial.print("SHT31: ");
  if (data.sht31Ok) {
    Serial.print("envTemp=");
    Serial.print(data.envTempC, 1);
    Serial.print(" C, humidity=");
    Serial.print(data.humidity, 1);
    Serial.println(" %");
  } else {
    Serial.println("read failed");
  }

  Serial.print("DS18B20: ");
  if (data.ds18b20Ok) {
    Serial.print("cableTemp=");
    Serial.print(data.cableTempC, 1);
    Serial.println(" C");
  } else {
    Serial.println("read failed. Check DATA pin and pull-up resistor.");
  }

  Serial.print("MQ-2 smoke raw: ");
  Serial.println(data.smokeRaw);

  Serial.print("Risk score: ");
  Serial.print(data.riskScore);
  Serial.print(" / 100, status=");
  if (data.riskScore >= 60) {
    Serial.println("ALARM");
  } else if (data.riskScore >= 30) {
    Serial.println("WARNING");
  } else {
    Serial.println("NORMAL");
  }
}

void appendJsonNumber(String &json, const char* key, float value, int decimals, bool &hasPrevious) {
  if (hasPrevious) json += ",";
  json += "\"";
  json += key;
  json += "\":";
  json += String(value, decimals);
  hasPrevious = true;
}

void appendJsonInt(String &json, const char* key, int value, bool &hasPrevious) {
  if (hasPrevious) json += ",";
  json += "\"";
  json += key;
  json += "\":";
  json += String(value);
  hasPrevious = true;
}

String buildSensorPayload(const SensorData &data) {
  String json = "{";
  bool hasPrevious = false;

  if (hasPrevious) json += ",";
  json += "\"deviceId\":\"";
  json += DEVICE_ID;
  json += "\"";
  hasPrevious = true;

  if (data.sht31Ok) {
    appendJsonNumber(json, "temperature", data.envTempC, 1, hasPrevious);
    appendJsonNumber(json, "humidity", data.humidity, 1, hasPrevious);
  }

  if (data.ds18b20Ok) {
    appendJsonNumber(json, "cableTemp", data.cableTempC, 1, hasPrevious);
  }

  // This first prototype does not include current/leakage sensors yet.
  // Keep both fields at 0 so the backend schema stays stable.
  appendJsonNumber(json, "current", 0.0, 1, hasPrevious);
  appendJsonNumber(json, "leakage", 0.0, 1, hasPrevious);

  // Convert the ESP32 ADC raw value into a smaller display value for the website.
  // Tune this scale after observing your MQ-2 baseline.
  appendJsonNumber(json, "smoke", data.smokeRaw / 10.0, 1, hasPrevious);
  appendJsonInt(json, "riskScore", data.riskScore, hasPrevious);

  json += "}";
  return json;
}

void uploadSensorData(const SensorData &data) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi disconnected. Reconnecting before upload...");
    connectWiFi();
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Upload skipped: Wi-Fi is not connected.");
    return;
  }

  HTTPClient http;
  http.setTimeout(8000);
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json; charset=utf-8");

  String payload = buildSensorPayload(data);
  Serial.print("Uploading to server: ");
  Serial.println(payload);

  int statusCode = http.POST(payload);
  Serial.print("HTTP status: ");
  Serial.println(statusCode);

  if (statusCode > 0) {
    String response = http.getString();
    Serial.print("Server response: ");
    Serial.println(response);
  } else {
    Serial.print("Upload failed: ");
    Serial.println(http.errorToString(statusCode));
  }

  http.end();
}
