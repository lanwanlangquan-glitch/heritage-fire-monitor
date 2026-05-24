const demoDevices = [
  {
    id: "D-A01",
    name: "大雄宝殿配电箱 A 区",
    status: "高风险",
    risk: 82,
    updatedAt: new Date().toISOString(),
    values: {
      temperature: 31.8,
      humidity: 36,
      cableTemp: 68.4,
      current: 18.6,
      leakage: 31,
      smoke: 386,
    },
  },
  {
    id: "D-B02",
    name: "藏经阁梁柱节点",
    status: "关注",
    risk: 58,
    updatedAt: new Date().toISOString(),
    values: {
      temperature: 29.4,
      humidity: 32,
      cableTemp: 41.2,
      current: 5.8,
      leakage: 8,
      smoke: 172,
    },
  },
  {
    id: "D-C03",
    name: "库房环境节点",
    status: "正常",
    risk: 24,
    updatedAt: new Date().toISOString(),
    values: {
      temperature: 25.1,
      humidity: 48,
      cableTemp: 30.6,
      current: 1.4,
      leakage: 3,
      smoke: 86,
    },
  },
  {
    id: "D-D04",
    name: "游客区无线节点",
    status: "正常",
    risk: 31,
    updatedAt: new Date().toISOString(),
    values: {
      temperature: 26.3,
      humidity: 45,
      cableTemp: 34.5,
      current: 3.2,
      leakage: 5,
      smoke: 104,
    },
  },
];

const metricMeta = [
  { key: "temperature", label: "环境温度", unit: "°C", limit: 45 },
  { key: "humidity", label: "相对湿度", unit: "%", limit: 28, lowAlert: true },
  { key: "cableTemp", label: "线缆温度", unit: "°C", limit: 60 },
  { key: "current", label: "负载电流", unit: "A", limit: 16 },
  { key: "smoke", label: "烟雾值", unit: "ppm", limit: 300 },
];

const demoTickets = [
  {
    level: "danger",
    title: "配电箱 A 区线缆温度超限",
    desc: "68.4°C，建议立即巡检端子松动与负载情况",
  },
  {
    level: "warning",
    title: "藏经阁环境湿度偏低",
    desc: "木结构干燥风险上升，建议调整巡检频率",
  },
  {
    level: "normal",
    title: "库房节点巡检已归档",
    desc: "现场照片与处理记录已同步",
  },
];

let devices = structuredClone(demoDevices);
let tickets = structuredClone(demoTickets);
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
  return backendConnected ? "真实后端在线" : "演示数据模式";
}

function ensureSelectedDeviceExists() {
  if (!devices[selectedDevice]) selectedDevice = 0;
}

function renderDevices() {
  ensureSelectedDeviceExists();
  deviceList.innerHTML = devices
    .map((device, index) => {
      const active = index === selectedDevice ? " active" : "";
      const updatedAt = device.updatedAt ? new Date(device.updatedAt).toLocaleTimeString("zh-CN", { hour12: false }) : "未上报";
      return `
        <button class="device-item${active}" type="button" data-index="${index}">
          <strong>${device.name}</strong>
          <span>${device.id} · ${device.status} · 风险 ${device.risk} · ${updatedAt}</span>
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
      const trend = alert ? "超过预警阈值" : "运行稳定";
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
    .map((ticket) => {
      return `
        <article class="ticket ${ticket.level}">
          <strong>${ticket.title}</strong>
          <span>${ticket.desc}</span>
        </article>
      `;
    })
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
  if (Array.isArray(state.tickets)) {
    tickets = state.tickets;
  }
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
      device.status = "高风险";
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
  eventSource.addEventListener("snapshot", (event) => {
    applyServerState(JSON.parse(event.data));
  });
  eventSource.addEventListener("sensor-update", (event) => {
    applyServerState(JSON.parse(event.data));
  });
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
