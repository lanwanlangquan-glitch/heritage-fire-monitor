const devices = [
  {
    id: "D-A01",
    name: "大雄宝殿配电箱 A 区",
    status: "高风险",
    risk: 82,
    values: {
      temperature: 31.8,
      humidity: 36,
      cableTemp: 68.4,
      current: 18.6,
      smoke: 386,
    },
  },
  {
    id: "D-B02",
    name: "藏经阁梁柱节点",
    status: "关注",
    risk: 58,
    values: {
      temperature: 29.4,
      humidity: 32,
      cableTemp: 41.2,
      current: 5.8,
      smoke: 172,
    },
  },
  {
    id: "D-C03",
    name: "库房环境节点",
    status: "正常",
    risk: 24,
    values: {
      temperature: 25.1,
      humidity: 48,
      cableTemp: 30.6,
      current: 1.4,
      smoke: 86,
    },
  },
  {
    id: "D-D04",
    name: "游客区无线节点",
    status: "正常",
    risk: 31,
    values: {
      temperature: 26.3,
      humidity: 45,
      cableTemp: 34.5,
      current: 3.2,
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

const tickets = [
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

let selectedDevice = 0;
let alarmMode = false;

const deviceList = document.querySelector("#deviceList");
const metricsGrid = document.querySelector("#metricsGrid");
const riskPill = document.querySelector("#riskPill");
const dashboardTitle = document.querySelector("#dashboardTitle");
const ticketList = document.querySelector("#ticketList");

function riskClass(risk) {
  if (risk >= 75) return "danger";
  if (risk >= 45) return "warning";
  return "normal";
}

function renderDevices() {
  deviceList.innerHTML = devices
    .map((device, index) => {
      const active = index === selectedDevice ? " active" : "";
      return `
        <button class="device-item${active}" type="button" data-index="${index}">
          <strong>${device.name}</strong>
          <span>${device.id} · ${device.status} · 风险 ${device.risk}</span>
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
      const value = device.values[metric.key];
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
  const device = devices[selectedDevice];
  dashboardTitle.textContent = device.name;
  riskPill.textContent = `${device.status} ${device.risk}`;
  riskPill.className = `risk-pill ${riskClass(device.risk)}`;
  renderDevices();
  renderMetrics(device);
  renderTickets();
}

function jitterData() {
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

document.querySelector("#refreshData").addEventListener("click", jitterData);
document.querySelector("#simulateAlarm").addEventListener("click", () => {
  alarmMode = !alarmMode;
  jitterData();
});

renderDashboard();
