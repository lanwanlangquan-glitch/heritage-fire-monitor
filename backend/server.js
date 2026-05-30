const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const port = Number(process.env.PORT || 3000);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(__dirname, "data");
const thresholdsPath = path.join(dataDir, "thresholds.json");
const alertsPath = path.join(dataDir, "alerts.json");
const clients = new Set();
const devices = new Map();
const analyticsTimeZone = process.env.ANALYTICS_TIMEZONE || "Asia/Shanghai";
const offlineAfterMs = Number(process.env.DEVICE_OFFLINE_AFTER_MS || 5 * 60 * 1000);

fs.mkdirSync(dataDir, { recursive: true });

const text = {
  high: "\u9ad8\u98ce\u9669",
  alarm: "\u544a\u8b66",
  watch: "\u5173\u6ce8",
  normal: "\u6b63\u5e38",
  noTicketsTitle: "\u5f53\u524d\u65e0\u5f85\u5904\u7406\u544a\u8b66",
  noTicketsDesc: "\u6240\u6709\u5728\u7ebf\u76d1\u6d4b\u8282\u70b9\u5904\u4e8e\u6b63\u5e38\u8303\u56f4\u3002",
  highAlert: "\u9ad8\u98ce\u9669\u544a\u8b66",
  watchAlert: "\u9700\u8981\u5173\u6ce8",
  risk: "\u98ce\u9669",
  inspectNow: "\u8bf7\u7acb\u5373\u5de1\u68c0\u7ebf\u7f06\u6e29\u5ea6\u3001\u6f0f\u7535\u6d41\u548c\u70df\u96fe\u72b6\u6001\u3002",
  inspectSoon: "\u5efa\u8bae\u63d0\u9ad8\u5de1\u68c0\u9891\u7387\u5e76\u6838\u67e5\u8bbe\u5907\u72b6\u6001\u3002",
  pending: "\u5f85\u5904\u7406",
  handling: "\u5904\u7406\u4e2d",
  resolved: "\u5df2\u5904\u7406",
};

const thresholdMeta = {
  temperature: { label: "\u6e29\u5ea6\u9608\u503c", unit: "\u00b0C", defaultValue: 45, reason: "\u73af\u5883\u6e29\u5ea6\u8d85\u8fc7\u9608\u503c" },
  humidityLow: { label: "\u6e7f\u5ea6\u4e0b\u9650", unit: "%", defaultValue: 28, reason: "\u76f8\u5bf9\u6e7f\u5ea6\u4f4e\u4e8e\u4e0b\u9650" },
  cableTemp: { label: "\u7ebf\u7f06\u6e29\u5ea6\u9608\u503c", unit: "\u00b0C", defaultValue: 60, reason: "\u7ebf\u7f06\u6e29\u5ea6\u8d85\u8fc7\u9608\u503c" },
  current: { label: "\u7535\u6d41\u9608\u503c", unit: "A", defaultValue: 16, reason: "\u8d1f\u8f7d\u7535\u6d41\u8d85\u8fc7\u9608\u503c" },
  leakage: { label: "\u6f0f\u7535\u9608\u503c", unit: "mA", defaultValue: 30, reason: "\u6f0f\u7535\u7535\u6d41\u8d85\u8fc7\u9608\u503c" },
  smoke: { label: "\u70df\u96fe\u9608\u503c", unit: "ppm", defaultValue: 300, reason: "\u70df\u96fe\u503c\u8d85\u8fc7\u9608\u503c" },
};

let thresholds = loadThresholds();
let alerts = loadAlerts();

const defaultDevices = [
  ["D-A01", "\u5927\u96c4\u5b9d\u6bbf\u914d\u7535\u7bb1 A \u533a"],
  ["D-B02", "\u85cf\u7ecf\u9601\u6881\u67f1\u8282\u70b9"],
  ["D-C03", "\u5e93\u623f\u73af\u5883\u8282\u70b9"],
  ["D-D04", "\u6e38\u5ba2\u533a\u65e0\u7ebf\u8282\u70b9"],
];

function readJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Failed to read ${filePath}`, error);
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadThresholds() {
  const stored = readJsonFile(thresholdsPath, {});
  const next = {};
  for (const [key, meta] of Object.entries(thresholdMeta)) {
    next[key] = number(stored[key], meta.defaultValue);
  }
  return next;
}

function saveThresholds(nextThresholds) {
  thresholds = loadThresholds();
  for (const key of Object.keys(thresholdMeta)) {
    if (Object.prototype.hasOwnProperty.call(nextThresholds, key)) {
      thresholds[key] = number(nextThresholds[key], thresholds[key]);
    }
  }
  writeJsonFile(thresholdsPath, thresholds);
  return thresholds;
}

function loadAlerts() {
  const stored = readJsonFile(alertsPath, []);
  return Array.isArray(stored) ? stored.slice(0, 200) : [];
}

function saveAlerts() {
  alerts = alerts.slice(0, 200);
  writeJsonFile(alertsPath, alerts);
}

for (const [id, name] of defaultDevices) {
  devices.set(id, normalizeReading({ deviceId: id, location: name }));
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(1)) : fallback;
}

function calculateRisk(values) {
  let risk = 8;
  if (values.temperature >= thresholds.temperature) risk += 15;
  if (values.humidity > 0 && values.humidity <= thresholds.humidityLow) risk += 12;
  if (values.cableTemp >= thresholds.cableTemp) risk += 30;
  if (values.current >= thresholds.current) risk += 18;
  if (values.leakage >= thresholds.leakage) risk += 20;
  if (values.smoke >= thresholds.smoke) risk += 28;
  return Math.min(100, risk);
}

function statusFromRisk(risk) {
  if (risk >= 85) return text.high;
  if (risk >= 65) return text.alarm;
  if (risk >= 45) return text.watch;
  return text.normal;
}

function deviceOnline(updatedAt) {
  return Boolean(updatedAt) && Date.now() - new Date(updatedAt).getTime() <= offlineAfterMs;
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
  const now = new Date().toISOString();
  return {
    id,
    name: safeName,
    status: statusFromRisk(risk),
    risk,
    updatedAt: now,
    online: true,
    values,
  };
}

function publicDevice(device) {
  return {
    ...device,
    online: deviceOnline(device.updatedAt),
  };
}

function valueForThreshold(values, key) {
  if (key === "humidityLow") return values.humidity;
  return values[key];
}

function thresholdExceeded(values, key, threshold) {
  const value = valueForThreshold(values, key);
  if (key === "humidityLow") return value > 0 && value <= threshold;
  return value >= threshold;
}

function buildAlertReasons(reading) {
  return Object.entries(thresholdMeta)
    .filter(([key]) => thresholdExceeded(reading.values, key, thresholds[key]))
    .map(([key, meta]) => {
      const value = valueForThreshold(reading.values, key);
      return `${meta.reason}: ${value}${meta.unit} / ${thresholds[key]}${meta.unit}`;
    });
}

function recordAlerts(reading) {
  const reasons = buildAlertReasons(reading);
  if (!reasons.length) return;
  const now = new Date().toISOString();
  for (const reason of reasons) {
    alerts.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      time: now,
      deviceId: reading.id,
      location: reading.name,
      level: statusFromRisk(reading.risk),
      reason,
      status: text.pending,
    });
  }
  saveAlerts();
}

function formatDateKey(dateInput = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: analyticsTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateInput));
}

function formatHourKey(dateInput = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: analyticsTimeZone,
    hour: "2-digit",
    hour12: false,
  }).format(new Date(dateInput));
}

function historyFilePath(dateKey) {
  return path.join(dataDir, `history-${dateKey}.jsonl`);
}

function persistReading(reading) {
  const record = {
    timestamp: reading.updatedAt,
    deviceId: reading.id,
    name: reading.name,
    risk: reading.risk,
    status: reading.status,
    values: reading.values,
  };
  const targetFile = historyFilePath(formatDateKey(reading.updatedAt));
  fs.appendFile(targetFile, `${JSON.stringify(record)}\n`, (error) => {
    if (error) {
      console.error("Failed to persist sensor reading", error);
    }
  });
}

function readHistory(dateKey) {
  const targetFile = historyFilePath(dateKey);
  if (!fs.existsSync(targetFile)) return [];
  return fs
    .readFileSync(targetFile, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
}

function listHistoryDates() {
  return fs
    .readdirSync(dataDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^history-\d{4}-\d{2}-\d{2}\.jsonl$/.test(entry.name))
    .map((entry) => entry.name.replace(/^history-/, "").replace(/\.jsonl$/, ""));
}

function average(values) {
  if (!values.length) return 0;
  const total = values.reduce((sum, item) => sum + Number(item || 0), 0);
  return Number((total / values.length).toFixed(1));
}

function computeInsights(records, hourly, metricSummary) {
  const insights = [];
  const alertRecords = records.filter((record) => Number(record.risk || 0) >= 75);
  const maxCable = metricSummary.find((metric) => metric.key === "cableTemp")?.max || 0;
  const avgHumidity = metricSummary.find((metric) => metric.key === "humidity")?.avg || 0;
  const maxSmoke = metricSummary.find((metric) => metric.key === "smoke")?.max || 0;
  const peakHour = [...hourly]
    .filter((hour) => hour.sampleCount > 0)
    .sort((a, b) => Number(b.risk || 0) - Number(a.risk || 0))[0];

  if (alertRecords.length) {
    insights.push(`\u5f53\u65e5\u51fa\u73b0 ${alertRecords.length} \u6b21\u9ad8\u98ce\u9669\u6837\u672c\uff0c\u9700\u8981\u590d\u67e5\u5bf9\u5e94\u65f6\u6bb5\u7684\u7535\u6c14\u4e0e\u70df\u96fe\u60c5\u51b5\u3002`);
  }
  if (maxCable >= 60) {
    insights.push(`\u7ebf\u7f06\u6e29\u5ea6\u5f53\u65e5\u5cf0\u503c ${maxCable}\u00b0C\uff0c\u5df2\u8fbe\u5230\u9884\u8b66\u9608\u503c\uff0c\u5efa\u8bae\u68c0\u67e5\u63a5\u7ebf\u7aef\u5b50\u4e0e\u8d1f\u8f7d\u3002`);
  }
  if (avgHumidity > 0 && avgHumidity <= 28) {
    insights.push(`\u5f53\u65e5\u5e73\u5747\u6e7f\u5ea6 ${avgHumidity}%\uff0c\u6728\u7ed3\u6784\u5e72\u71e5\u98ce\u9669\u504f\u9ad8\uff0c\u53ef\u63d0\u9ad8\u5de1\u68c0\u9891\u7387\u3002`);
  }
  if (maxSmoke >= 300) {
    insights.push(`\u70df\u96fe\u503c\u6700\u9ad8\u8fbe\u5230 ${maxSmoke}\uff0c\u5efa\u8bae\u56de\u770b\u8be5\u65f6\u6bb5\u7684\u73af\u5883\u6216\u6d4b\u8bd5\u8bb0\u5f55\u3002`);
  }
  if (peakHour) {
    insights.push(`\u98ce\u9669\u6700\u9ad8\u65f6\u6bb5\u51fa\u73b0\u5728 ${peakHour.label}\uff0c\u5f53\u65f6\u5e73\u5747\u98ce\u9669\u5206 ${peakHour.risk}\u3002`);
  }
  if (!insights.length) {
    insights.push(`\u5f53\u65e5\u672a\u53d1\u73b0\u660e\u663e\u5f02\u5e38\uff0c\u7cfb\u7edf\u8fd0\u884c\u6570\u636e\u603b\u4f53\u5e73\u7a33\u3002`);
  }
  return insights.slice(0, 4);
}

function buildDailyAnalytics(records, dateKey, requestedDeviceId = "") {
  const filtered = requestedDeviceId ? records.filter((record) => record.deviceId === requestedDeviceId) : records;
  const hourlyBuckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${String(hour).padStart(2, "0")}:00`,
    sampleCount: 0,
    risk: 0,
    temperature: 0,
    humidity: 0,
    cableTemp: 0,
    current: 0,
    leakage: 0,
    smoke: 0,
  }));

  const totals = {
    sampleCount: filtered.length,
    alertCount: filtered.filter((record) => Number(record.risk || 0) >= 75).length,
    avgRisk: average(filtered.map((record) => record.risk)),
    maxRisk: filtered.reduce((max, record) => Math.max(max, Number(record.risk || 0)), 0),
    deviceCount: new Set(filtered.map((record) => record.deviceId)).size,
  };

  filtered.forEach((record) => {
    const hour = Number(formatHourKey(record.timestamp));
    const bucket = hourlyBuckets[hour];
    if (!bucket) return;
    bucket.sampleCount += 1;
    bucket.risk += Number(record.risk || 0);
    bucket.temperature += Number(record.values?.temperature || 0);
    bucket.humidity += Number(record.values?.humidity || 0);
    bucket.cableTemp += Number(record.values?.cableTemp || 0);
    bucket.current += Number(record.values?.current || 0);
    bucket.leakage += Number(record.values?.leakage || 0);
    bucket.smoke += Number(record.values?.smoke || 0);
  });

  const hourly = hourlyBuckets.map((bucket) => {
    if (!bucket.sampleCount) return bucket;
    return {
      ...bucket,
      risk: Number((bucket.risk / bucket.sampleCount).toFixed(1)),
      temperature: Number((bucket.temperature / bucket.sampleCount).toFixed(1)),
      humidity: Number((bucket.humidity / bucket.sampleCount).toFixed(1)),
      cableTemp: Number((bucket.cableTemp / bucket.sampleCount).toFixed(1)),
      current: Number((bucket.current / bucket.sampleCount).toFixed(1)),
      leakage: Number((bucket.leakage / bucket.sampleCount).toFixed(1)),
      smoke: Number((bucket.smoke / bucket.sampleCount).toFixed(1)),
    };
  });

  const metrics = [
    ["temperature", "\u73af\u5883\u6e29\u5ea6", "\u00b0C"],
    ["humidity", "\u76f8\u5bf9\u6e7f\u5ea6", "%"],
    ["cableTemp", "\u7ebf\u7f06\u6e29\u5ea6", "\u00b0C"],
    ["current", "\u8d1f\u8f7d\u7535\u6d41", "A"],
    ["leakage", "\u6f0f\u7535\u7535\u6d41", "mA"],
    ["smoke", "\u70df\u96fe\u503c", "ppm"],
  ].map(([key, label, unit]) => {
    const values = filtered.map((record) => Number(record.values?.[key] || 0));
    return {
      key,
      label,
      unit,
      min: values.length ? Number(Math.min(...values).toFixed(1)) : 0,
      avg: average(values),
      max: values.length ? Number(Math.max(...values).toFixed(1)) : 0,
    };
  });

  const scope = requestedDeviceId
    ? devices.get(requestedDeviceId)
      ? { deviceId: requestedDeviceId, name: devices.get(requestedDeviceId).name }
      : { deviceId: requestedDeviceId, name: requestedDeviceId }
    : { deviceId: "", name: "\u5168\u90e8\u8bbe\u5907" };

  return {
    date: dateKey,
    scope,
    totals,
    metrics,
    hourly,
    insights: computeInsights(filtered, hourly, metrics),
  };
}

function buildHistory(deviceId = "", limit = 120) {
  const dates = listHistoryDates().sort().reverse().slice(0, 7);
  const records = dates.flatMap((dateKey) => readHistory(dateKey));
  return records
    .filter((record) => !deviceId || record.deviceId === deviceId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-limit);
}

function thresholdResponse() {
  return {
    thresholds,
    meta: Object.fromEntries(
      Object.entries(thresholdMeta).map(([key, meta]) => [
        key,
        { label: meta.label, unit: meta.unit },
      ])
    ),
  };
}

function buildTickets() {
  const list = [];
  for (const device of devices.values()) {
    const publicItem = publicDevice(device);
    if (!publicItem.online) continue;
    if (device.risk >= 85) {
      list.push({
        level: "danger",
        title: `${device.name} ${text.highAlert}`,
        desc: `${text.risk} ${device.risk}\uff0c${text.inspectNow}`,
      });
    } else if (device.risk >= 45) {
      list.push({
        level: "warning",
        title: `${device.name} ${text.watchAlert}`,
        desc: `${text.risk} ${device.risk}\uff0c${text.inspectSoon}`,
      });
    }
  }
  if (!list.length) {
    list.push({ level: "normal", title: text.noTicketsTitle, desc: text.noTicketsDesc });
  }
  return list.slice(0, 6);
}

function snapshot() {
  return {
    devices: Array.from(devices.values()).map(publicDevice).sort((a, b) => b.risk - a.risk),
    tickets: buildTickets(),
    alerts: alerts.slice(0, 50),
    thresholds,
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
    ".webp": "image/webp",
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
    const cacheHeader = pathname.startsWith("/assets/") ? "public, max-age=604800" : "no-cache";
    res.writeHead(200, { "Content-Type": mimeType(filePath), "Cache-Control": cacheHeader });
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

  if (req.method === "GET" && url.pathname === "/api/alerts") {
    sendJson(res, 200, { alerts: alerts.slice(0, 100) });
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/alerts/") && url.pathname.endsWith("/status")) {
    try {
      const alertId = decodeURIComponent(url.pathname.split("/")[3] || "");
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const nextStatus = String(payload.status || text.resolved);
      const target = alerts.find((alert) => alert.id === alertId);
      if (!target) {
        sendJson(res, 404, { ok: false, error: "Alert not found" });
        return;
      }
      target.status = nextStatus;
      target.handledAt = new Date().toISOString();
      saveAlerts();
      broadcast("sensor-update", snapshot());
      sendJson(res, 200, { ok: true, alert: target });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/history") {
    const requestedDeviceId = String(url.searchParams.get("deviceId") || "");
    const limit = Math.min(500, Math.max(10, Number(url.searchParams.get("limit") || 120)));
    sendJson(res, 200, { records: buildHistory(requestedDeviceId, limit) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/thresholds") {
    sendJson(res, 200, thresholdResponse());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/thresholds") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      saveThresholds(payload.thresholds || payload);
      broadcast("sensor-update", snapshot());
      sendJson(res, 200, { ok: true, ...thresholdResponse() });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/device-config") {
    sendJson(res, 200, thresholdResponse());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/analytics/dates") {
    sendJson(res, 200, { dates: listHistoryDates().sort().reverse() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/analytics/daily") {
    const requestedDate = String(url.searchParams.get("date") || formatDateKey());
    const requestedDeviceId = String(url.searchParams.get("deviceId") || "");
    const records = readHistory(requestedDate);
    sendJson(res, 200, buildDailyAnalytics(records, requestedDate, requestedDeviceId));
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
      persistReading(reading);
      recordAlerts(reading);
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
