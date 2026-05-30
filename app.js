const labels = {
  high: "\u9ad8\u98ce\u9669",
  alarm: "\u544a\u8b66",
  watch: "\u5173\u6ce8",
  normal: "\u6b63\u5e38",
  online: "\u5728\u7ebf",
  offline: "\u79bb\u7ebf",
  backendOnline: "\u771f\u5b9e\u540e\u7aef\u5728\u7ebf",
  demoMode: "\u6f14\u793a\u6570\u636e\u6a21\u5f0f",
  backendOffline: "\u540e\u7aef\u672a\u8fde\u63a5\uff0c\u5df2\u5207\u6362\u6f14\u793a\u6570\u636e",
  connecting: "\u6b63\u5728\u8fde\u63a5\u540e\u7aef",
  synced: "\u5df2\u540c\u6b65",
  waiting: "\u7b49\u5f85\u6570\u636e\u540c\u6b65",
  onlineNodes: "\u5728\u7ebf\u8282\u70b9",
  highRiskNodes: "\u9ad8\u98ce\u9669\u70b9",
  avgRisk: "\u5e73\u5747\u98ce\u9669",
  lastUpdate: "\u6700\u8fd1\u540c\u6b65",
  pendingTickets: "\u5f85\u5904\u7406",
  rankReady: "\u5df2\u6309\u98ce\u9669\u6392\u5e8f",
  allDevices: "\u5168\u90e8\u8bbe\u5907\u65e5\u62a5",
  analyticsReady: "\u65e5\u62a5\u5df2\u751f\u6210",
  analyticsDemo: "\u6682\u7528\u5b9e\u65f6\u6570\u636e\u751f\u6210\u9884\u89c8",
  noSamples: "\u5f53\u65e5\u6682\u65e0\u5386\u53f2\u6837\u672c",
  samples: "\u91c7\u6837\u6570",
  alertCount: "\u9ad8\u98ce\u9669\u6b21\u6570",
  maxRisk: "\u6700\u9ad8\u98ce\u9669",
  deviceCount: "\u8986\u76d6\u8bbe\u5907",
  avg: "\u5e73\u5747",
  min: "\u6700\u5c0f",
  max: "\u6700\u5927",
  generatedFromLive: "\u5df2\u7528\u5f53\u524d\u5b9e\u65f6\u6570\u636e\u751f\u6210\u9884\u89c8\u62a5\u544a\u3002",
  devices: "\u8bbe\u5907",
  alerts: "\u544a\u8b66",
  noAlerts: "\u6682\u65e0\u544a\u8b66\u8bb0\u5f55",
  pending: "\u5f85\u5904\u7406",
  handling: "\u5904\u7406\u4e2d",
  resolved: "\u5df2\u5904\u7406",
  markHandling: "\u5904\u7406\u4e2d",
  markResolved: "\u5df2\u5904\u7406",
  thresholdSaved: "\u9608\u503c\u5df2\u4fdd\u5b58",
  thresholdLocal: "\u672c\u5730\u9608\u503c\u9884\u89c8",
  historyReady: "\u5386\u53f2\u6570\u636e",
  historyFallback: "\u6682\u7528\u5b9e\u65f6\u6570\u636e",
  noHistory: "\u6682\u65e0\u5386\u53f2\u6570\u636e",
  temperature: "\u6e29\u5ea6",
  leakage: "\u6f0f\u7535",
  localAckTitle: "\u672c\u5730\u544a\u8b66\u5df2\u786e\u8ba4",
  localAckDesc: "\u9875\u9762\u5df2\u6682\u65f6\u6536\u8d77\u544a\u8b66\uff0c\u771f\u5b9e\u540e\u7aef\u6570\u636e\u4e0b\u6b21\u540c\u6b65\u540e\u4f1a\u6062\u590d\u3002",
  cloudTestLocal: "\u5df2\u5728\u672c\u5730\u751f\u6210\u6d4b\u8bd5\u544a\u8b66",
  threshold: "\u8d85\u8fc7\u9884\u8b66\u9608\u503c",
  stable: "\u8fd0\u884c\u7a33\u5b9a",
  deviceA: "\u5927\u96c4\u5b9d\u6bbf\u914d\u7535\u7bb1 A \u533a",
  deviceB: "\u85cf\u7ecf\u9601\u6881\u67f1\u8282\u70b9",
  deviceC: "\u5e93\u623f\u73af\u5883\u8282\u70b9",
  deviceD: "\u6e38\u5ba2\u533a\u65e0\u7ebf\u8282\u70b9",
  testDevice: "\u4e91\u7aef\u6d4b\u8bd5\u8282\u70b9",
  temp: "\u73af\u5883\u6e29\u5ea6",
  humidity: "\u76f8\u5bf9\u6e7f\u5ea6",
  cableTemp: "\u7ebf\u7f06\u6e29\u5ea6",
  current: "\u8d1f\u8f7d\u7535\u6d41",
  smoke: "\u70df\u96fe\u503c",
  ticketA: "\u914d\u7535\u7bb1 A \u533a\u7ebf\u7f06\u6e29\u5ea6\u8d85\u9650",
  ticketADesc: "68.4\u00b0C\uff0c\u5efa\u8bae\u7acb\u5373\u5de1\u68c0\u7aef\u5b50\u677e\u52a8\u4e0e\u8d1f\u8f7d\u60c5\u51b5",
  ticketB: "\u85cf\u7ecf\u9601\u73af\u5883\u6e7f\u5ea6\u504f\u4f4e",
  ticketBDesc: "\u6728\u7ed3\u6784\u5e72\u71e5\u98ce\u9669\u4e0a\u5347\uff0c\u5efa\u8bae\u8c03\u6574\u5de1\u68c0\u9891\u7387",
  ticketC: "\u5e93\u623f\u8282\u70b9\u5de1\u68c0\u5df2\u5f52\u6863",
  ticketCDesc: "\u73b0\u573a\u7167\u7247\u4e0e\u5904\u7406\u8bb0\u5f55\u5df2\u540c\u6b65",
};

const demoDevices = [
  {
    id: "D-A01",
    name: labels.deviceA,
    status: labels.high,
    risk: 82,
    online: true,
    updatedAt: new Date().toISOString(),
    values: { temperature: 31.8, humidity: 36, cableTemp: 68.4, current: 18.6, leakage: 31, smoke: 386 },
  },
  {
    id: "D-B02",
    name: labels.deviceB,
    status: labels.watch,
    risk: 58,
    online: true,
    updatedAt: new Date().toISOString(),
    values: { temperature: 29.4, humidity: 32, cableTemp: 41.2, current: 5.8, leakage: 8, smoke: 172 },
  },
  {
    id: "D-C03",
    name: labels.deviceC,
    status: labels.normal,
    risk: 24,
    online: true,
    updatedAt: new Date().toISOString(),
    values: { temperature: 25.1, humidity: 48, cableTemp: 30.6, current: 1.4, leakage: 3, smoke: 86 },
  },
  {
    id: "D-D04",
    name: labels.deviceD,
    status: labels.normal,
    risk: 31,
    online: true,
    updatedAt: new Date().toISOString(),
    values: { temperature: 26.3, humidity: 45, cableTemp: 34.5, current: 3.2, leakage: 5, smoke: 104 },
  },
];

const metricMeta = [
  { key: "temperature", label: labels.temp, unit: "\u00b0C", limit: 45 },
  { key: "humidity", label: labels.humidity, unit: "%", limit: 28, lowAlert: true },
  { key: "cableTemp", label: labels.cableTemp, unit: "\u00b0C", limit: 60 },
  { key: "current", label: labels.current, unit: "A", limit: 16 },
  { key: "smoke", label: labels.smoke, unit: "ppm", limit: 300 },
];

const demoTickets = [
  { level: "danger", title: labels.ticketA, desc: labels.ticketADesc },
  { level: "warning", title: labels.ticketB, desc: labels.ticketBDesc },
  { level: "normal", title: labels.ticketC, desc: labels.ticketCDesc },
];

let devices = JSON.parse(JSON.stringify(demoDevices));
let tickets = JSON.parse(JSON.stringify(demoTickets));
let selectedDevice = 0;
let alarmMode = false;
let backendConnected = false;
let backendAttempted = false;
let lastSyncAt = null;
let alertRecords = [];
let thresholds = { temperature: 45, smoke: 300, current: 16, cableTemp: 60 };
let historyMetric = "temperature";

const deviceList = document.querySelector("#deviceList");
const metricsGrid = document.querySelector("#metricsGrid");
const riskPill = document.querySelector("#riskPill");
const dashboardTitle = document.querySelector("#dashboardTitle");
const ticketList = document.querySelector("#ticketList");
const refreshButton = document.querySelector("#refreshData");
const alarmButton = document.querySelector("#simulateAlarm");
const connectionDot = document.querySelector("#connectionDot");
const connectionState = document.querySelector("#connectionState");
const lastSync = document.querySelector("#lastSync");
const summaryGrid = document.querySelector("#summaryGrid");
const ticketCount = document.querySelector("#ticketCount");
const riskBars = document.querySelector("#riskBars");
const riskRankStatus = document.querySelector("#riskRankStatus");
const ackAllTickets = document.querySelector("#ackAllTickets");
const testCloudAlarm = document.querySelector("#testCloudAlarm");
const heroImage = document.querySelector(".hero-image");
const hero = document.querySelector(".hero");
const analyticsDate = document.querySelector("#analyticsDate");
const refreshAnalytics = document.querySelector("#refreshAnalytics");
const analyticsStatus = document.querySelector("#analyticsStatus");
const analyticsScope = document.querySelector("#analyticsScope");
const analyticsSummary = document.querySelector("#analyticsSummary");
const analyticsMetrics = document.querySelector("#analyticsMetrics");
const analyticsInsights = document.querySelector("#analyticsInsights");
const trendChart = document.querySelector("#trendChart");
const volumeChart = document.querySelector("#volumeChart");
const trendStatus = document.querySelector("#trendStatus");
const volumeStatus = document.querySelector("#volumeStatus");
const refreshMonitor = document.querySelector("#refreshMonitor");
const deviceStatusCount = document.querySelector("#deviceStatusCount");
const deviceStatusTable = document.querySelector("#deviceStatusTable");
const alertRecordCount = document.querySelector("#alertRecordCount");
const alertRecordTable = document.querySelector("#alertRecordTable");
const historyStatus = document.querySelector("#historyStatus");
const historyChart = document.querySelector("#historyChart");
const historyMetricButtons = document.querySelectorAll("[data-history-metric]");
const thresholdStatus = document.querySelector("#thresholdStatus");
const thresholdForm = document.querySelector("#thresholdForm");

const configuredApiBase = (window.APP_CONFIG?.apiBaseUrl || "").replace(/\/$/, "");
const canUseRelativeApi = location.protocol.startsWith("http") && !location.hostname.endsWith("github.io");
const apiBase = configuredApiBase || (canUseRelativeApi ? "" : null);

function apiUrl(path) {
  return `${apiBase}${path}`;
}

function riskClass(risk) {
  if (risk >= 85) return "danger";
  if (risk >= 65) return "alarm";
  if (risk >= 45) return "warning";
  return "normal";
}

function riskLevel(device) {
  if (!device?.online) return labels.offline;
  const risk = Number(device.risk || 0);
  if (risk >= 85) return labels.high;
  if (risk >= 65) return labels.alarm;
  if (risk >= 45) return labels.watch;
  return labels.normal;
}

function modeText() {
  return backendConnected ? labels.backendOnline : labels.demoMode;
}

function formatTime(value) {
  if (!value) return "--";
  return new Date(value).toLocaleTimeString("zh-CN", { hour12: false });
}

function formatDateTime(value) {
  if (!value) return "--";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function markHeroLoaded() {
  if (!hero || !heroImage) return;
  if (heroImage.complete) {
    hero.classList.add("is-loaded");
    return;
  }
  heroImage.addEventListener("load", () => hero.classList.add("is-loaded"), { once: true });
}

function setBackendState(isConnected) {
  backendAttempted = true;
  backendConnected = isConnected;
  if (isConnected) lastSyncAt = new Date();
}

function ensureSelectedDeviceExists() {
  if (!devices[selectedDevice]) selectedDevice = 0;
}

function getSummary() {
  const online = devices.filter((device) => device.updatedAt).length;
  const highRisk = devices.filter((device) => Number(device.risk || 0) >= 75).length;
  const average = devices.length ? Math.round(devices.reduce((sum, device) => sum + Number(device.risk || 0), 0) / devices.length) : 0;
  return { online, highRisk, average };
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function average(values) {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
  return Number((total / values.length).toFixed(1));
}

function buildLiveAnalytics() {
  const metrics = metricMeta.map((metric) => {
    const values = devices.map((device) => Number(device.values?.[metric.key] || 0));
    return {
      key: metric.key,
      label: metric.label,
      unit: metric.unit,
      min: values.length ? Number(Math.min(...values).toFixed(1)) : 0,
      avg: average(values),
      max: values.length ? Number(Math.max(...values).toFixed(1)) : 0,
    };
  });
  const hour = new Date().getHours();
  const hourly = Array.from({ length: 24 }, (_, index) => ({
    hour: index,
    label: `${String(index).padStart(2, "0")}:00`,
    sampleCount: index === hour ? Math.max(devices.length, 1) : 0,
    risk: index === hour ? average(devices.map((device) => device.risk)) : 0,
    cableTemp: index === hour ? average(devices.map((device) => device.values?.cableTemp)) : 0,
    smoke: index === hour ? average(devices.map((device) => device.values?.smoke)) : 0,
  }));
  return {
    date: analyticsDate?.value || localDateKey(),
    scope: { name: labels.allDevices },
    totals: {
      sampleCount: devices.length,
      alertCount: devices.filter((device) => device.risk >= 75).length,
      avgRisk: average(devices.map((device) => device.risk)),
      maxRisk: devices.reduce((max, device) => Math.max(max, Number(device.risk || 0)), 0),
      deviceCount: devices.length,
    },
    metrics,
    hourly,
    insights: [labels.generatedFromLive],
  };
}

function renderConnection() {
  if (!connectionState || !connectionDot || !lastSync) return;
  connectionDot.className = `status-dot ${backendConnected ? "online" : backendAttempted ? "offline" : ""}`;
  connectionState.textContent = backendConnected ? labels.backendOnline : backendAttempted ? labels.backendOffline : labels.connecting;
  lastSync.textContent = lastSyncAt ? `${labels.synced} ${formatTime(lastSyncAt)}` : labels.waiting;
}

function renderSummary() {
  if (!summaryGrid) return;
  const summary = getSummary();
  const latest = devices
    .map((device) => device.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1);
  const cards = [
    { label: labels.onlineNodes, value: `${summary.online}/${devices.length}`, tone: "green" },
    { label: labels.highRiskNodes, value: summary.highRisk, tone: summary.highRisk ? "danger" : "green" },
    { label: labels.avgRisk, value: summary.average, tone: riskClass(summary.average) },
    { label: labels.lastUpdate, value: formatTime(latest || lastSyncAt), tone: "blue" },
  ];
  summaryGrid.innerHTML = cards
    .map((card) => `
      <article class="summary-card ${card.tone}">
        <span>${card.label}</span>
        <strong>${card.value}</strong>
      </article>
    `)
    .join("");
}

function renderDevices() {
  ensureSelectedDeviceExists();
  deviceList.innerHTML = devices
    .map((device, index) => {
      const active = index === selectedDevice ? " active" : "";
      const updatedAt = formatTime(device.updatedAt);
      return `
        <button class="device-item${active}" type="button" data-index="${index}">
          <strong>${device.name}</strong>
          <span>${device.id} / ${device.status} / ${device.risk} / ${updatedAt}</span>
        </button>
      `;
    })
    .join("");

  deviceList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDevice = Number(button.dataset.index);
      renderDashboard();
    });
  });
}

function renderMetrics(device) {
  metricsGrid.innerHTML = metricMeta
    .map((metric) => {
      const value = device.values?.[metric.key] ?? 0;
      const alert = metric.lowAlert ? value < metric.limit : value > metric.limit;
      const trend = alert ? labels.threshold : labels.stable;
      return `
        <article class="metric-card${alert ? " alert" : ""}">
          <span>${metric.label}</span>
          <strong>${value}${metric.unit}</strong>
          <small>${trend}</small>
        </article>
      `;
    })
    .join("");
}

function renderTickets() {
  if (ticketCount) ticketCount.textContent = `${tickets.length} ${labels.pendingTickets}`;
  ticketList.innerHTML = tickets
    .map((ticket) => `
      <article class="ticket ${ticket.level}">
        <strong>${ticket.title}</strong>
        <span>${ticket.desc}</span>
      </article>
    `)
    .join("");
}

function renderRiskBars() {
  if (!riskBars) return;
  const sorted = [...devices].sort((a, b) => Number(b.risk || 0) - Number(a.risk || 0));
  if (riskRankStatus) riskRankStatus.textContent = labels.rankReady;
  riskBars.innerHTML = sorted
    .map((device) => `
      <article class="risk-bar ${riskClass(device.risk)}">
        <div>
          <strong>${device.name}</strong>
          <span>${device.id} / ${device.status}</span>
        </div>
        <meter min="0" max="100" value="${device.risk}"></meter>
        <b>${device.risk}</b>
      </article>
    `)
    .join("");
}

function renderDeviceStatusTable() {
  if (!deviceStatusTable) return;
  if (deviceStatusCount) deviceStatusCount.textContent = `${devices.length} ${labels.devices}`;
  deviceStatusTable.innerHTML = devices
    .map((device) => {
      const state = device.online ? labels.online : labels.offline;
      const tone = device.online ? riskClass(device.risk) : "offline";
      return `
        <tr>
          <td><span class="state-badge ${device.online ? "online" : "offline"}">${state}</span></td>
          <td>${device.id}</td>
          <td>${device.name}</td>
          <td>${formatDateTime(device.updatedAt)}</td>
          <td><span class="risk-tag ${tone}">${riskLevel(device)}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderAlertRecords() {
  if (!alertRecordTable) return;
  if (alertRecordCount) alertRecordCount.textContent = `${alertRecords.length} ${labels.alerts}`;
  if (!alertRecords.length) {
    alertRecordTable.innerHTML = `
      <tr>
        <td colspan="5">${labels.noAlerts}</td>
      </tr>
    `;
    return;
  }
  alertRecordTable.innerHTML = alertRecords
    .map((alert) => `
      <tr>
        <td>${formatDateTime(alert.time)}</td>
        <td>${alert.location || alert.deviceId}</td>
        <td>${alert.reason}</td>
        <td><span class="state-badge ${alert.status === labels.resolved ? "online" : "offline"}">${alert.status || labels.pending}</span></td>
        <td>
          <button class="mini-action" type="button" data-alert-id="${alert.id}" data-next-status="${labels.handling}">${labels.markHandling}</button>
          <button class="mini-action" type="button" data-alert-id="${alert.id}" data-next-status="${labels.resolved}">${labels.markResolved}</button>
        </td>
      </tr>
    `)
    .join("");

  alertRecordTable.querySelectorAll("[data-alert-id]").forEach((button) => {
    button.addEventListener("click", () => updateAlertStatus(button.dataset.alertId, button.dataset.nextStatus));
  });
}

function historyLabel(metric) {
  return {
    temperature: labels.temperature,
    humidity: labels.humidity,
    smoke: labels.smoke,
    current: labels.current,
  }[metric] || metric;
}

function historyUnit(metric) {
  return {
    temperature: "\u00b0C",
    humidity: "%",
    smoke: "ppm",
    current: "A",
  }[metric] || "";
}

function buildLiveHistoryRecords() {
  return devices.map((device, index) => ({
    timestamp: device.updatedAt || new Date(Date.now() - (devices.length - index) * 60000).toISOString(),
    deviceId: device.id,
    name: device.name,
    values: device.values || {},
  }));
}

function renderHistoryChart(records, isFallback = false) {
  if (!historyChart) return;
  if (historyStatus) historyStatus.textContent = isFallback ? labels.historyFallback : `${historyLabel(historyMetric)} ${labels.historyReady}`;
  const data = (records?.length ? records : buildLiveHistoryRecords()).slice(-60);
  if (!data.length) {
    historyChart.innerHTML = `<p>${labels.noHistory}</p>`;
    return;
  }
  const values = data.map((record) => Number(record.values?.[historyMetric] || 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
      const y = 92 - ((value - min) / span) * 82;
      return `${x},${y}`;
    })
    .join(" ");
  historyChart.innerHTML = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
      <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2.6" vector-effect="non-scaling-stroke"></polyline>
    </svg>
    <div class="chart-readout">
      <span>${historyLabel(historyMetric)}</span>
      <strong>${values.at(-1) || 0}${historyUnit(historyMetric)}</strong>
      <span>${labels.min} ${min}${historyUnit(historyMetric)} / ${labels.max} ${max}${historyUnit(historyMetric)}</span>
    </div>
  `;
}

function renderThresholdForm() {
  if (!thresholdForm) return;
  Object.entries(thresholds).forEach(([key, value]) => {
    const input = thresholdForm.elements[key];
    if (input) input.value = value;
  });
}

function renderMonitor() {
  renderDeviceStatusTable();
  renderAlertRecords();
  renderThresholdForm();
}

function renderAnalyticsSummary(data) {
  if (!analyticsSummary) return;
  const totals = data.totals || {};
  const cards = [
    { label: labels.samples, value: totals.sampleCount || 0, tone: "blue" },
    { label: labels.alertCount, value: totals.alertCount || 0, tone: totals.alertCount ? "danger" : "green" },
    { label: labels.maxRisk, value: totals.maxRisk || 0, tone: riskClass(totals.maxRisk || 0) },
    { label: labels.deviceCount, value: totals.deviceCount || 0, tone: "green" },
  ];
  analyticsSummary.innerHTML = cards
    .map((card) => `
      <article class="summary-card ${card.tone}">
        <span>${card.label}</span>
        <strong>${card.value}</strong>
      </article>
    `)
    .join("");
}

function renderAnalyticsMetrics(data) {
  if (!analyticsMetrics) return;
  analyticsMetrics.innerHTML = (data.metrics || [])
    .map((metric) => `
      <article class="metric-row">
        <strong>${metric.label}</strong>
        <span>${labels.avg} ${metric.avg}${metric.unit} / ${labels.max} ${metric.max}${metric.unit} / ${labels.min} ${metric.min}${metric.unit}</span>
      </article>
    `)
    .join("");
}

function renderAnalyticsInsights(data) {
  if (!analyticsInsights) return;
  const insights = data.insights?.length ? data.insights : [labels.noSamples];
  analyticsInsights.innerHTML = insights.map((item) => `<p>${item}</p>`).join("");
}

function renderTrendChart(data) {
  if (!trendChart || !volumeChart) return;
  const hourly = data.hourly?.length ? data.hourly : buildLiveAnalytics().hourly;
  const maxSmoke = Math.max(1, ...hourly.map((item) => Number(item.smoke || 0)));
  const maxSamples = Math.max(1, ...hourly.map((item) => Number(item.sampleCount || 0)));
  trendChart.innerHTML = hourly
    .map((item) => {
      const riskHeight = Math.max(4, Number(item.risk || 0));
      const tempHeight = Math.max(4, Math.min(100, Number(item.cableTemp || 0) * 1.35));
      return `
        <div class="chart-column" title="${item.label}">
          <span class="chart-bar risk" style="height: ${riskHeight}%"></span>
          <span class="chart-bar temp" style="height: ${tempHeight}%"></span>
          <small>${item.hour % 6 === 0 ? String(item.hour).padStart(2, "0") : ""}</small>
        </div>
      `;
    })
    .join("");
  volumeChart.innerHTML = hourly
    .map((item) => {
      const sampleHeight = Math.max(4, (Number(item.sampleCount || 0) / maxSamples) * 100);
      const smokeHeight = Math.max(4, (Number(item.smoke || 0) / maxSmoke) * 100);
      return `
        <div class="chart-column" title="${item.label}">
          <span class="chart-bar sample" style="height: ${sampleHeight}%"></span>
          <span class="chart-bar smoke" style="height: ${smokeHeight}%"></span>
          <small>${item.hour % 6 === 0 ? String(item.hour).padStart(2, "0") : ""}</small>
        </div>
      `;
    })
    .join("");
  if (trendStatus) trendStatus.textContent = data.totals?.sampleCount ? `${data.totals.avgRisk || 0}` : "--";
  if (volumeStatus) volumeStatus.textContent = `${data.totals?.sampleCount || 0}`;
}

function renderAnalytics(data, isFallback = false) {
  if (!analyticsStatus) return;
  analyticsStatus.textContent = isFallback ? labels.analyticsDemo : labels.analyticsReady;
  if (analyticsScope) analyticsScope.textContent = data.scope?.name || labels.allDevices;
  renderAnalyticsSummary(data);
  renderAnalyticsMetrics(data);
  renderAnalyticsInsights(data);
  renderTrendChart(data);
}

async function loadAnalytics() {
  if (!analyticsDate?.value) analyticsDate.value = localDateKey();
  if (!apiBase && apiBase !== "") {
    renderAnalytics(buildLiveAnalytics(), true);
    return;
  }

  try {
    const response = await fetch(apiUrl(`/api/analytics/daily?date=${encodeURIComponent(analyticsDate.value)}`), { cache: "no-store" });
    if (!response.ok) throw new Error("analytics unavailable");
    const data = await response.json();
    if (!data.totals?.sampleCount) {
      renderAnalytics(buildLiveAnalytics(), true);
      return;
    }
    renderAnalytics(data, false);
  } catch (error) {
    renderAnalytics(buildLiveAnalytics(), true);
  }
}

async function loadAlerts() {
  if (!apiBase && apiBase !== "") {
    alertRecords = demoTickets.map((ticket, index) => ({
      id: `demo-${index}`,
      time: new Date(Date.now() - index * 600000).toISOString(),
      location: devices[index]?.name || labels.deviceA,
      reason: ticket.title,
      status: index === 2 ? labels.resolved : labels.pending,
    }));
    renderAlertRecords();
    return;
  }
  try {
    const response = await fetch(apiUrl("/api/alerts"), { cache: "no-store" });
    if (!response.ok) throw new Error("alerts unavailable");
    const data = await response.json();
    alertRecords = data.alerts || [];
    renderAlertRecords();
  } catch (error) {
    alertRecords = [];
    renderAlertRecords();
  }
}

async function loadThresholds() {
  if (!apiBase && apiBase !== "") {
    renderThresholdForm();
    if (thresholdStatus) thresholdStatus.textContent = labels.thresholdLocal;
    return;
  }
  try {
    const response = await fetch(apiUrl("/api/thresholds"), { cache: "no-store" });
    if (!response.ok) throw new Error("thresholds unavailable");
    const data = await response.json();
    thresholds = { ...thresholds, ...(data.thresholds || {}) };
    renderThresholdForm();
    if (thresholdStatus) thresholdStatus.textContent = "Server config";
  } catch (error) {
    renderThresholdForm();
    if (thresholdStatus) thresholdStatus.textContent = labels.thresholdLocal;
  }
}

async function loadHistory() {
  const selectedId = devices[selectedDevice]?.id || "";
  if (!apiBase && apiBase !== "") {
    renderHistoryChart(buildLiveHistoryRecords(), true);
    return;
  }
  try {
    const response = await fetch(apiUrl(`/api/history?deviceId=${encodeURIComponent(selectedId)}&limit=120`), { cache: "no-store" });
    if (!response.ok) throw new Error("history unavailable");
    const data = await response.json();
    renderHistoryChart(data.records || [], !(data.records || []).length);
  } catch (error) {
    renderHistoryChart(buildLiveHistoryRecords(), true);
  }
}

async function loadMonitor() {
  await Promise.all([loadAlerts(), loadThresholds(), loadHistory()]);
  renderMonitor();
}

async function updateAlertStatus(alertId, status) {
  if (!alertId) return;
  if (!apiBase && apiBase !== "") {
    alertRecords = alertRecords.map((alert) => (alert.id === alertId ? { ...alert, status } : alert));
    renderAlertRecords();
    return;
  }
  try {
    await fetch(apiUrl(`/api/alerts/${encodeURIComponent(alertId)}/status`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadAlerts();
  } catch (error) {
    await loadAlerts();
  }
}

async function saveThresholdForm(event) {
  event.preventDefault();
  const formData = new FormData(thresholdForm);
  const next = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, Number(value)]));
  thresholds = { ...thresholds, ...next };
  if (!apiBase && apiBase !== "") {
    if (thresholdStatus) thresholdStatus.textContent = labels.thresholdLocal;
    renderDashboard();
    return;
  }
  try {
    const response = await fetch(apiUrl("/api/thresholds"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thresholds: next }),
    });
    if (!response.ok) throw new Error("save threshold failed");
    const data = await response.json();
    thresholds = { ...thresholds, ...(data.thresholds || {}) };
    if (thresholdStatus) thresholdStatus.textContent = labels.thresholdSaved;
    renderThresholdForm();
    loadBackendSnapshot();
  } catch (error) {
    if (thresholdStatus) thresholdStatus.textContent = labels.thresholdLocal;
  }
}

function renderDashboard() {
  ensureSelectedDeviceExists();
  const device = devices[selectedDevice];
  dashboardTitle.textContent = device.name;
  riskPill.textContent = `${device.status} ${device.risk}`;
  riskPill.title = modeText();
  riskPill.className = `risk-pill ${riskClass(device.risk)}`;
  renderConnection();
  renderSummary();
  renderDevices();
  renderMetrics(device);
  renderTickets();
  renderRiskBars();
  renderMonitor();
}

function applyServerState(state) {
  if (Array.isArray(state.devices) && state.devices.length) {
    const selectedId = devices[selectedDevice]?.id;
    devices = state.devices;
    const nextIndex = devices.findIndex((device) => device.id === selectedId);
    selectedDevice = nextIndex >= 0 ? nextIndex : 0;
  }
  if (Array.isArray(state.tickets)) tickets = state.tickets;
  if (Array.isArray(state.alerts)) alertRecords = state.alerts;
  if (state.thresholds) thresholds = { ...thresholds, ...state.thresholds };
  setBackendState(true);
  renderDashboard();
}

function jitterData() {
  if (backendConnected) {
    loadBackendSnapshot();
    return;
  }

  devices.forEach((device) => {
    Object.keys(device.values).forEach((key) => {
      const delta = key === "smoke" ? Math.round(Math.random() * 18 - 8) : Number((Math.random() * 1.6 - 0.7).toFixed(1));
      device.values[key] = Number((device.values[key] + delta).toFixed(1));
    });
    if (alarmMode && device.id === "D-A01") {
      device.values.cableTemp = Number((device.values.cableTemp + 3.4).toFixed(1));
      device.values.smoke += 42;
      device.risk = Math.min(96, device.risk + 4);
      device.status = labels.high;
    }
  });
  renderDashboard();
}

async function loadBackendSnapshot() {
  if (!apiBase && apiBase !== "") return;
  try {
    const [devicesResponse, ticketsResponse] = await Promise.all([
      fetch(apiUrl("/api/devices"), { cache: "no-store" }),
      fetch(apiUrl("/api/tickets"), { cache: "no-store" }),
    ]);
    if (!devicesResponse.ok || !ticketsResponse.ok) throw new Error("API unavailable");
    const [serverDevices, serverTickets] = await Promise.all([devicesResponse.json(), ticketsResponse.json()]);
    applyServerState({ devices: serverDevices.devices, tickets: serverTickets.tickets });
  } catch (error) {
    setBackendState(false);
    renderDashboard();
  }
}

function connectEvents() {
  if (!apiBase && apiBase !== "") return;
  const eventSource = new EventSource(apiUrl("/api/events"));
  eventSource.addEventListener("snapshot", (event) => applyServerState(JSON.parse(event.data)));
  eventSource.addEventListener("sensor-update", (event) => applyServerState(JSON.parse(event.data)));
  eventSource.onerror = () => {
    setBackendState(false);
    eventSource.close();
    setTimeout(connectEvents, 5000);
    renderDashboard();
  };
}

async function postTestAlarm() {
  const payload = {
    deviceId: "D-TEST",
    location: labels.testDevice,
    temperature: 38.8,
    humidity: 27,
    cableTemp: 72.6,
    current: 19.4,
    leakage: 34,
    smoke: 420,
  };

  if (!apiBase && apiBase !== "") {
    alarmMode = true;
    tickets = [{ level: "danger", title: labels.cloudTestLocal, desc: labels.ticketADesc }, ...demoTickets];
    jitterData();
    loadAnalytics();
    return;
  }

  try {
    const response = await fetch(apiUrl("/api/sensor-data"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("post failed");
    const result = await response.json();
    applyServerState({ devices: [result.device, ...devices.filter((device) => device.id !== result.device.id)], tickets: result.tickets });
    loadAnalytics();
  } catch (error) {
    alarmMode = true;
    tickets = [{ level: "danger", title: labels.cloudTestLocal, desc: labels.ticketADesc }, ...demoTickets];
    jitterData();
    loadAnalytics();
  }
}

refreshButton?.addEventListener("click", jitterData);
alarmButton?.addEventListener("click", () => {
  alarmMode = !alarmMode;
  jitterData();
});
ackAllTickets?.addEventListener("click", () => {
  tickets = [{ level: "normal", title: labels.localAckTitle, desc: labels.localAckDesc }];
  renderDashboard();
});
testCloudAlarm?.addEventListener("click", postTestAlarm);
refreshAnalytics?.addEventListener("click", loadAnalytics);
analyticsDate?.addEventListener("change", loadAnalytics);
refreshMonitor?.addEventListener("click", loadMonitor);
thresholdForm?.addEventListener("submit", saveThresholdForm);
historyMetricButtons.forEach((button) => {
  button.addEventListener("click", () => {
    historyMetric = button.dataset.historyMetric || "temperature";
    historyMetricButtons.forEach((item) => item.classList.toggle("active", item === button));
    loadHistory();
  });
});

markHeroLoaded();
renderDashboard();
loadBackendSnapshot();
connectEvents();
loadAnalytics();
loadMonitor();
