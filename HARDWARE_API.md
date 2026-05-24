# 硬件对接接口

后端启动后，ESP32/STM32 通过 HTTP POST 上传传感器数据。

## 启动后端

```powershell
cd D:\AI\Codex\项目
python backend/server.py
```

本机访问：

```text
http://127.0.0.1:3000
```

同一 Wi-Fi 下的硬件访问时，把 `127.0.0.1` 换成电脑局域网 IP，例如：

```text
http://192.168.1.23:3000/api/sensor-data
```

## 上传地址

```text
POST /api/sensor-data
Content-Type: application/json
```

## JSON 示例

```json
{
  "deviceId": "D-A01",
  "location": "大雄宝殿配电箱 A 区",
  "temperature": 31.8,
  "humidity": 36,
  "cableTemp": 68.4,
  "current": 18.6,
  "leakage": 31,
  "smoke": 386
}
```

## ESP32 Arduino 示例

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "你的WiFi名称";
const char* password = "你的WiFi密码";
const char* serverUrl = "http://192.168.1.23:3000/api/sensor-data";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"deviceId\":\"D-A01\",";
    payload += "\"location\":\"大雄宝殿配电箱 A 区\",";
    payload += "\"temperature\":31.8,";
    payload += "\"humidity\":36,";
    payload += "\"cableTemp\":68.4,";
    payload += "\"current\":18.6,";
    payload += "\"leakage\":31,";
    payload += "\"smoke\":386";
    payload += "}";

    int code = http.POST(payload);
    Serial.println(code);
    Serial.println(http.getString());
    http.end();
  }
  delay(5000);
}
```

## 前端实时连接

网页会自动连接：

```text
GET /api/devices
GET /api/tickets
GET /api/events
```

`/api/events` 使用 SSE 实时推送，硬件一上报，网页会自动更新。

## Node 版本

如果你安装了 Node.js，也可以运行：

```powershell
node backend/server.js
```
