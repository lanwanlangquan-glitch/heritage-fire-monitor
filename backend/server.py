import json
import mimetypes
import os
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

PORT = int(os.environ.get("PORT", "3000"))
ROOT_DIR = Path(__file__).resolve().parent.parent
CLIENTS = []


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def number(value, fallback=0):
    try:
        return round(float(value), 1)
    except (TypeError, ValueError):
        return fallback


devices = {}


def calculate_risk(values):
    risk = 8
    if values["temperature"] >= 45:
        risk += 15
    if 0 < values["humidity"] <= 28:
        risk += 12
    if values["cableTemp"] >= 60:
        risk += 30
    if values["current"] >= 16:
        risk += 18
    if values["leakage"] >= 30:
        risk += 20
    if values["smoke"] >= 300:
        risk += 28
    return min(100, risk)


def status_from_risk(risk):
    if risk >= 75:
        return "高风险"
    if risk >= 45:
        return "关注"
    return "正常"


def normalize_reading(payload):
    device_id = str(payload.get("deviceId") or payload.get("id") or "D-UNKNOWN")
    previous = devices.get(device_id, {})
    previous_values = previous.get("values", {})
    incoming_name = str(payload.get("location") or payload.get("name") or "")
    safe_name = incoming_name if incoming_name and "?" not in incoming_name else previous.get("name") or device_id
    values = {
        "temperature": number(payload.get("temperature"), previous_values.get("temperature", 26)),
        "humidity": number(payload.get("humidity"), previous_values.get("humidity", 45)),
        "cableTemp": number(payload.get("cableTemp"), previous_values.get("cableTemp", 32)),
        "current": number(payload.get("current"), previous_values.get("current", 0)),
        "leakage": number(payload.get("leakage"), previous_values.get("leakage", 0)),
        "smoke": number(payload.get("smoke"), previous_values.get("smoke", 80)),
    }
    risk = calculate_risk(values)
    return {
        "id": device_id,
        "name": safe_name,
        "status": status_from_risk(risk),
        "risk": risk,
        "updatedAt": now_iso(),
        "values": values,
    }


for device_id, name in [
    ("D-A01", "大雄宝殿配电箱 A 区"),
    ("D-B02", "藏经阁梁柱节点"),
    ("D-C03", "库房环境节点"),
    ("D-D04", "游客区无线节点"),
]:
    devices[device_id] = normalize_reading({"deviceId": device_id, "location": name})


def build_tickets():
    tickets = []
    for device in devices.values():
        if device["risk"] >= 75:
            tickets.append({
                "level": "danger",
                "title": f"{device['name']} 高风险告警",
                "desc": f"风险 {device['risk']}，请立即巡检线缆温度、漏电流和烟雾状态。",
            })
        elif device["risk"] >= 45:
            tickets.append({
                "level": "warning",
                "title": f"{device['name']} 需要关注",
                "desc": f"风险 {device['risk']}，建议提高巡检频率并核查设备状态。",
            })
    if not tickets:
        tickets.append({
            "level": "normal",
            "title": "当前无待处理告警",
            "desc": "所有在线监测节点处于正常范围。",
        })
    return tickets[:6]


def snapshot():
    return {
        "devices": sorted(devices.values(), key=lambda item: item["risk"], reverse=True),
        "tickets": build_tickets(),
    }


def sse_payload(event_name, data):
    return f"event: {event_name}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n".encode("utf-8")


def broadcast(event_name, data):
    dead_clients = []
    payload = sse_payload(event_name, data)
    for client in CLIENTS:
        try:
            client.wfile.write(payload)
            client.wfile.flush()
        except Exception:
            dead_clients.append(client)
    for client in dead_clients:
        if client in CLIENTS:
            CLIENTS.remove(client)


class Handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, status, body):
        content = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self):
        pathname = urlparse(self.path).path
        if pathname == "/api/health":
            self.send_json(200, {"ok": True, "service": "heritage-fire-backend", "time": now_iso()})
            return
        if pathname == "/api/devices":
            self.send_json(200, {"devices": snapshot()["devices"]})
            return
        if pathname == "/api/tickets":
            self.send_json(200, {"tickets": snapshot()["tickets"]})
            return
        if pathname == "/api/events":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Connection", "keep-alive")
            self.end_headers()
            CLIENTS.append(self)
            self.wfile.write(sse_payload("snapshot", snapshot()))
            self.wfile.flush()
            try:
                while True:
                    time.sleep(30)
                    self.wfile.write(b": keepalive\n\n")
                    self.wfile.flush()
            except Exception:
                if self in CLIENTS:
                    CLIENTS.remove(self)
            return
        self.serve_static(pathname)

    def do_POST(self):
        pathname = urlparse(self.path).path
        if pathname != "/api/sensor-data":
            self.send_json(404, {"ok": False, "error": "Not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            reading = normalize_reading(payload)
            devices[reading["id"]] = reading
            state = snapshot()
            broadcast("sensor-update", state)
            self.send_json(200, {"ok": True, "device": reading, "tickets": state["tickets"]})
        except Exception as error:
            self.send_json(400, {"ok": False, "error": str(error)})

    def serve_static(self, pathname):
        safe_path = "/index.html" if pathname == "/" else unquote(pathname)
        file_path = (ROOT_DIR / safe_path.lstrip("/")).resolve()
        if not str(file_path).startswith(str(ROOT_DIR)) or ".git" in file_path.parts:
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b"Forbidden")
            return
        if not file_path.exists() or not file_path.is_file():
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")
            return
        content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        if file_path.suffix in {".html", ".css", ".js", ".json", ".txt", ".xml", ".webmanifest"}:
            content_type += "; charset=utf-8"
        content = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Heritage fire monitor backend running at http://127.0.0.1:{PORT}")
    print(f"Sensor POST endpoint: http://127.0.0.1:{PORT}/api/sensor-data")
    server.serve_forever()
