const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const port = Number(process.env.PORT || 3000);
const rootDir = path.resolve(__dirname, "..");
const clients = new Set();

const devices = new Map();

const defaultDevices = [
  ["D-A01", "大雄宝殿配电箱 A 区"],
  ["D-B02", "藏经阁梁柱节点"],
  ["D-C03", "库房环境节点"],
  ["D-D04", "游客区无线节点"],
];

for (const [id, name] of defaultDevices) {
  devices.set(id, normalizeReading({ deviceId: id, location: name }));
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(1)) : fallback;
}

function calculateRisk(values) {
  let risk = 8;
  if (values.temperature >= 45) risk += 15;
  if (values.humidity > 0 && values.humidity <= 28) risk += 12;
  if (values.cableTemp >= 60) risk += 30;
  if (values.current >= 16) risk += 18;
  if (values.leakage >= 30) risk += 20;
  if (values.smoke >= 300) risk += 28;
  return Math.min(100, risk);
}

function statusFromRisk(risk) {
  if (risk >= 75) return "高风险";
  if (risk >= 45) return "关注";
  return "正常";
}

function normalizeReading(payload) {
  const id = String(payload.deviceId || payload.id || "D-UNKNOWN");
  const previous = devices.get(id);
  const previousValues = previous?.values || {};
  const incomingName = String(payload.location || payload.name || "");
  const safeName = incomingName && !incomingName.includes("?") ? incomingName : previous?.name || id;
  const values = {
    temperature: number(payload.temperature, previousValues.temperature || 26),
    humidity: number(payload.humidity, previousValues.humidity || 45),
    cableTemp: number(payload.cableTemp, previousValues.cableTemp || 32),
    current: number(payload.current, previousValues.current || 0),
    leakage: number(payload.leakage, previousValues.leakage || 0),
    smoke: number(payload.smoke, previousValues.smoke || 80),
  };
  const risk = calculateRisk(values);
  return {
    id,
    name: safeName,
    status: statusFromRisk(risk),
    risk,
    updatedAt: new Date().toISOString(),
    values,
  };
}

function buildTickets() {
  const list = [];
  for (const device of devices.values()) {
    if (device.risk >= 75) {
      list.push({
        level: "danger",
        title: `${device.name} 高风险告警`,
        desc: `风险 ${device.risk}，请立即巡检线缆温度、漏电流和烟雾状态。`,
      });
    } else if (device.risk >= 45) {
      list.push({
        level: "warning",
        title: `${device.name} 需要关注`,
        desc: `风险 ${device.risk}，建议提高巡检频率并核查设备状态。`,
      });
    }
  }
  if (!list.length) {
    list.push({
      level: "normal",
      title: "当前无待处理告警",
      desc: "所有在线监测节点处于正常范围。",
    });
  }
  return list.slice(0, 6);
}

function snapshot() {
  return {
    devices: Array.from(devices.values()).sort((a, b) => b.risk - a.risk),
    tickets: buildTickets(),
  };
}

function sendJson(res, statusCode, body) {
  const content = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Cache-Control": "no-store",
  });
  res.end(content);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function broadcast(eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    res.write(payload);
  }
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
  }[ext] || "application/octet-stream";
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(rootDir, safePath));
  if (!filePath.startsWith(rootDir) || filePath.includes(`${path.sep}.git${path.sep}`)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mimeType(filePath) });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "heritage-fire-backend", time: new Date().toISOString() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/devices") {
    sendJson(res, 200, { devices: snapshot().devices });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/tickets") {
    sendJson(res, 200, { tickets: snapshot().tickets });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    clients.add(res);
    res.write(`event: snapshot\ndata: ${JSON.stringify(snapshot())}\n\n`);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/sensor-data") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const reading = normalizeReading(payload);
      devices.set(reading.id, reading);
      const state = snapshot();
      broadcast("sensor-update", state);
      sendJson(res, 200, { ok: true, device: reading, tickets: state.tickets });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message });
    }
    return;
  }

  serveStatic(req, res, decodeURIComponent(url.pathname));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Heritage fire monitor backend running at http://127.0.0.1:${port}`);
  console.log(`Sensor POST endpoint: http://127.0.0.1:${port}/api/sensor-data`);
});
