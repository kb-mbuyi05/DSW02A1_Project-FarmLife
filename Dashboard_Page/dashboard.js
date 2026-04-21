const marker = document.getElementById('marker');
const mapStatus = document.getElementById('mapStatus');
const activityFeed = document.getElementById('activityFeed');
const animalsCount = document.getElementById('animalsCount');
const alertsCount = document.getElementById('alertsCount');
const reportsCount = document.getElementById('reportsCount');
const inventoryCount = document.getElementById('inventoryCount');
const analyticsCount = document.getElementById('analyticsCount');
const communityCount = document.getElementById('communityCount');

const activityEvents = [
  'Bessie 04 entered North Pasture',
  'Water Station Ping from Karoo Farm',
  'Community report updated',
  'New stock added to Inventory',
  'Analytics chart refreshed',
  'Security alert reviewed',
  'Veterinary check scheduled',
];

function randomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateMetrics() {
  animalsCount.textContent = randomValue(110, 135);
  alertsCount.textContent = randomValue(5, 12);
  reportsCount.textContent = randomValue(2, 6);
  inventoryCount.textContent = randomValue(20, 34);
  analyticsCount.textContent = randomValue(5, 9);
  communityCount.textContent = randomValue(8, 16);
}

function addActivityEvent() {
  const message = activityEvents[randomValue(0, activityEvents.length - 1)];
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const item = document.createElement('div');
  item.className = 'activity-item';
  item.textContent = `${timestamp} - ${message}`;
  activityFeed.prepend(item);
  if (activityFeed.children.length > 6) {
    activityFeed.removeChild(activityFeed.lastChild);
  }
}

function updateMarker() {
  const battery = randomValue(60, 99);
  const names = ['Bessie 04', 'Karoo 12', 'Milo 18', 'Zuri 09'];
  const locations = ['North Pasture', 'Water Station', 'East Fence', 'Barn Entrance'];
  const name = names[randomValue(0, names.length - 1)];
  const location = locations[randomValue(0, locations.length - 1)];

  marker.textContent = `${name} (Battery ${battery}%)`;
  mapStatus.textContent = `${name} pinged from ${location}`;
}

function drawLineChart(canvas, labels, values) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const maxVal = Math.max(...values) + 10;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = padding + ((height - padding * 2) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3;
  ctx.beginPath();

  values.forEach((value, index) => {
    const x = padding + ((width - padding * 2) / (values.length - 1)) * index;
    const y = height - padding - ((height - padding * 2) * value) / maxVal;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  ctx.fillStyle = '#2563eb';
  values.forEach((value, index) => {
    const x = padding + ((width - padding * 2) / (values.length - 1)) * index;
    const y = height - padding - ((height - padding * 2) * value) / maxVal;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#475569';
  ctx.font = '13px Inter, sans-serif';
  values.forEach((value, index) => {
    const x = padding + ((width - padding * 2) / (values.length - 1)) * index;
    const y = height - padding + 20;
    ctx.fillText(labels[index], x - 15, y);
  });
}

function drawBarChart(canvas, labels, values) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const barWidth = (width - padding * 2) / values.length - 16;
  const maxVal = Math.max(...values) + 5;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = padding + ((height - padding * 2) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  values.forEach((value, index) => {
    const x = padding + index * (barWidth + 16);
    const barHeight = ((height - padding * 2) * value) / maxVal;
    const y = height - padding - barHeight;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#475569';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText(labels[index], x, height - padding + 20);
  });
}

function getHealthData() {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = labels.map(() => randomValue(70, 95));
  return { labels, values };
}

function getInventoryData() {
  const labels = ['Feed', 'Fuel', 'Fert', 'Med', 'Tools'];
  const values = labels.map(() => randomValue(2, 9));
  return { labels, values };
}

const healthCanvas = document.getElementById('healthChart');
const inventoryCanvas = document.getElementById('inventoryChart');

function renderCharts() {
  const healthData = getHealthData();
  const inventoryData = getInventoryData();
  if (healthCanvas) drawLineChart(healthCanvas, healthData.labels, healthData.values);
  if (inventoryCanvas) drawBarChart(inventoryCanvas, inventoryData.labels, inventoryData.values);
}

setInterval(() => {
  updateMarker();
  addActivityEvent();
  updateMetrics();
  renderCharts();
}, 5000);

updateMetrics();
addActivityEvent();
updateMarker();
renderCharts();

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop();
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', setActiveNavLink);