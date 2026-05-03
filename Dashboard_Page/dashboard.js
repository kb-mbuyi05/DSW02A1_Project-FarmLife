const mapElement = document.getElementById('map');
const trackerCaption = document.getElementById('trackerCaption');
const mapStatus = document.getElementById('mapStatus');
const activityFeed = document.getElementById('activityFeed');
const animalsCount = document.getElementById('animalsCount');
const alertsCount = document.getElementById('alertsCount');
const reportsCount = document.getElementById('reportsCount');
const inventoryCount = document.getElementById('inventoryCount');
const analyticsCount = document.getElementById('analyticsCount');
const communityCount = document.getElementById('communityCount');
const trackerControls = document.getElementById('trackerControls');
const animalMarkers = {};

const trackedAnimals = {
  'Milo 18': {
    battery: 72,
    speed: 14,
    path: [
      { x: 0.20, y: 0.38, heading: 40, area: 'East Range', direction: 'northeast' },
      { x: 0.26, y: 0.33, heading: 35, area: 'North Ridge', direction: 'northeast' },
      { x: 0.32, y: 0.28, heading: 30, area: 'River Bend', direction: 'northeast' },
      { x: 0.38, y: 0.25, heading: 15, area: 'Water Station', direction: 'east' }
    ],
    index: 0
  },
  'Bessie 04': {
    battery: 88,
    speed: 8,
    path: [
      { x: 0.45, y: 0.60, heading: 220, area: 'North Pasture', direction: 'southwest' },
      { x: 0.38, y: 0.67, heading: 230, area: 'Fence Line', direction: 'southwest' },
      { x: 0.34, y: 0.72, heading: 250, area: 'Barn Entrance', direction: 'west' }
    ],
    index: 0
  },
  'Karoo 12': {
    battery: 64,
    speed: 11,
    path: [
      { x: 0.68, y: 0.42, heading: 125, area: 'South Meadow', direction: 'southeast' },
      { x: 0.72, y: 0.50, heading: 115, area: 'Hidden Valley', direction: 'southeast' },
      { x: 0.76, y: 0.58, heading: 105, area: 'East Pasture', direction: 'east' }
    ],
    index: 0
  }
};

let activeAnimal = 'Milo 18';

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

function createDefaultPath() {
  const baseX = 0.15 + Math.random() * 0.75;
  const baseY = 0.25 + Math.random() * 0.55;
  return Array.from({ length: 4 }, (_, index) => {
    const x = Math.max(0.08, Math.min(0.92, baseX + (index * 0.06 - 0.12) + (Math.random() - 0.5) * 0.03));
    const y = Math.max(0.12, Math.min(0.88, baseY + (index * 0.05 - 0.1) + (Math.random() - 0.5) * 0.03));
    const heading = 20 + Math.round(Math.random() * 160);
    const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
    return {
      x,
      y,
      heading,
      area: ['North Pasture', 'East Range', 'Barn Entrance', 'River Bend', 'Fence Line', 'Water Station'][index] || 'Open Field',
      direction: directions[index % directions.length]
    };
  });
}

function registerTrackedAnimal(name, battery = randomValue(60, 90), speed = randomValue(6, 18), path = null) {
  if (trackedAnimals[name]) return trackedAnimals[name];
  trackedAnimals[name] = {
    battery,
    speed,
    path: path || createDefaultPath(),
    index: 0
  };
  renderTrackerButtons();
  return trackedAnimals[name];
}

function renderTrackerButtons() {
  if (!trackerControls) return;
  trackerControls.innerHTML = '<span>Tracking:</span>';

  Object.keys(trackedAnimals).forEach(animalName => {
    const button = document.createElement('button');
    button.className = `tracker-btn ${animalName === activeAnimal ? 'active' : ''}`;
    button.type = 'button';
    button.dataset.animal = animalName;
    button.textContent = animalName;
    button.addEventListener('click', () => setActiveTracker(animalName));
    trackerControls.appendChild(button);
  });
}

function createAnimalMarker(animalName) {
  if (!mapElement) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'tracker dynamic';
  wrapper.dataset.animal = animalName;
  wrapper.innerHTML = `
    <div class="tracker-shadow"></div>
    <div class="tracker-body"></div>
    <div class="tracker-direction"></div>
    <div class="tracker-label">${animalName}</div>
  `;
  mapElement.appendChild(wrapper);
  animalMarkers[animalName] = wrapper;
  return wrapper;
}

function renderAnimalMarkers() {
  if (!mapElement) return;
  Object.keys(trackedAnimals).forEach(animalName => {
    if (!animalMarkers[animalName]) {
      createAnimalMarker(animalName);
    }
  });
  Object.keys(animalMarkers).forEach(name => {
    if (!trackedAnimals[name]) {
      const markerEl = animalMarkers[name];
      if (markerEl && markerEl.parentNode) markerEl.parentNode.removeChild(markerEl);
      delete animalMarkers[name];
    }
  });
}

function updateMarkerPositions() {
  Object.entries(trackedAnimals).forEach(([animalName, animal]) => {
    if (!animalMarkers[animalName]) createAnimalMarker(animalName);
    animal.index = (animal.index + 1) % animal.path.length;
    const step = animal.path[animal.index];
    const markerEl = animalMarkers[animalName];
    markerEl.style.left = `${step.x * 100}%`;
    markerEl.style.top = `${step.y * 100}%`;
    markerEl.style.transform = `translate(-50%, -50%) rotateZ(${step.heading}deg)`;
    markerEl.querySelector('.tracker-direction').style.transform = `translateX(-50%) rotate(${step.heading}deg)`;
    markerEl.querySelector('.tracker-label').textContent = animalName;

    if (animalName === activeAnimal) {
      markerEl.classList.add('active');
      trackerCaption.textContent = `Heading ${step.direction} toward ${step.area} • Speed ${animal.speed} km/h • Battery ${animal.battery}%`;
      mapStatus.textContent = `${animalName} pinged from ${step.area}`;
    } else {
      markerEl.classList.remove('active');
    }
  });
}

function setActiveTracker(animalName) {
  registerTrackedAnimal(animalName);
  activeAnimal = animalName;
  renderTrackerButtons();
  updateMarkerPositions();
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
  updateMarkerPositions();
  addActivityEvent();
  updateMetrics();
  renderCharts();
}, 5000);

updateMetrics();
addActivityEvent();
renderTrackerButtons();
renderAnimalMarkers();
setActiveTracker(activeAnimal);
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