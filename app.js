const labels = {
  high: "\u9ad8\u98ce\u9669",
  watch: "\u5173\u6ce8",
  normal: "\u6b63\u5e38",
  backendOnline: "\u771f\u5b9e\u540e\u7aef\u5728\u7ebf",
  demoMode: "\u6f14\u793a\u6570\u636e\u6a21\u5f0f",
  threshold: "\u8d85\u8fc7\u9884\u8b66\u9608\u503c",
  stable: "\u8fd0\u884c\u7a33\u5b9a",
  deviceA: "\u5927\u96c4\u5b9d\u6bbf\u914d\u7535\u7bb1 A \u533a",
  deviceB: "\u85cf\u7ecf\u9601\u6881\u67f1\u8282\u70b9",
  deviceC: "\u5e93\u623f\u73af\u5883\u8282\u70b9",
  deviceD: "\u6e38\u5ba2\u533a\u65e0\u7ebf\u8282\u70b9",
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
    updatedAt: new Date().toISOString(),
    values: { temperature: 31.8, humidity: 36, cableTemp: 68.4, current: 18.6, leakage: 31, smoke: 386 },
  },
  {
    id: "D-B02",
    name: labels.deviceB,
    status: labels.watch,
    risk: 58,
    updatedAt: new Date().toISOString(),
    values: { temperature: 29.4, humidity: 32, cableTemp: 41.2, current: 5.8, leakage: 8, smoke: 172 },
  },
  {
    id: "D-C03",
    name: labels.deviceC,
    status: labels.normal,
    risk: 24,
    updatedAt: new Date().toISOString(),
    values: { temperature: 25.1, humidity: 48, cableTemp: 30.6, current: 1.4, leakage: 3, smoke: 86 },
  },
  {
    id: "D-D04",
    name: labels.deviceD,
    status: labels.normal,
    risk: 31,
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

const deviceList = document.querySelector("#deviceList");
const metricsGrid = document.querySelector("#metricsGrid");
const riskPill = document.querySelector("#riskPill");
const dashboardTitle = document.querySelector("#dashboardTitle");
const ticketList = document.querySelector("#ticketList");
const refreshButton = document.querySelector("#refreshData");
const alarmButton = document.querySelector("#simulateAlarm");

const configuredApiBase = (window.APP_CONFIG?.apiBaseUrl || "").replace(/\/$/, "");
const canUseRelativeApi = location.protocol.startsWith("http") && !location.hostname.endsWith("github.io");
const apiBase = configuredApiBase || (canUseRelativeApi ? "" : null);

function apiUrl(path) {
  return `${apiBase}${path}`;
}

function riskClass(risk) {
  if (risk >= 75) return "danger";
  if (risk >= 45) return "warning";
  return "normal";
}

function modeText() {
  return backendConnected ? labels.backendOnline : labels.demoMode;
}

function ensureSelectedDeviceExists() {
  if (!devices[selectedDevice]) selectedDevice = 0;
}

function renderDevices() {
  ensureSelectedDeviceExists();
  deviceList.innerHTML = devices
    .map((device, index) => {
      const active = index === selectedDevice ? " active" : "";
      const updatedAt = device.updatedAt ? new Date(device.updatedAt).toLocaleTimeString("zh-CN", { hour12: false }) : "--";
      return `
        <button class="device-item${active}" type="button" data-index="${index}">
          <strong>${device.name}</strong>
          <span>${device.id} · ${device.status} · ${device.risk} · ${updatedAt}</span>
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
  ticketList.innerHTML = tickets
    .map((ticket) => `
      <article class="ticket ${ticket.level}">
        <strong>${ticket.title}</strong>
        <span>${ticket.desc}</span>
      </article>
    `)
    .join("");
}

function renderDashboard() {
  ensureSelectedDeviceExists();
  const device = devices[selectedDevice];
  dashboardTitle.textContent = device.name;
  riskPill.textContent = `${device.status} ${device.risk}`;
  riskPill.title = modeText();
  riskPill.className = `risk-pill ${riskClass(device.risk)}`;
  renderDevices();
  renderMetrics(device);
  renderTickets();
}

function applyServerState(state) {
  if (Array.isArray(state.devices) && state.devices.length) {
    const selectedId = devices[selectedDevice]?.id;
    devices = state.devices;
    const nextIndex = devices.findIndex((device) => device.id === selectedId);
    selectedDevice = nextIndex >= 0 ? nextIndex : 0;
  }
  if (Array.isArray(state.tickets)) tickets = state.tickets;
  backendConnected = true;
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
    backendConnected = false;
    renderDashboard();
  }
}

function connectEvents() {
  if (!apiBase && apiBase !== "") return;
  const eventSource = new EventSource(apiUrl("/api/events"));
  eventSource.addEventListener("snapshot", (event) => applyServerState(JSON.parse(event.data)));
  eventSource.addEventListener("sensor-update", (event) => applyServerState(JSON.parse(event.data)));
  eventSource.onerror = () => {
    backendConnected = false;
    eventSource.close();
    setTimeout(connectEvents, 5000);
    renderDashboard();
  };
}

refreshButton.addEventListener("click", jitterData);
alarmButton.addEventListener("click", () => {
  alarmMode = !alarmMode;
  jitterData();
});

renderDashboard();
loadBackendSnapshot();
connectEvents();
