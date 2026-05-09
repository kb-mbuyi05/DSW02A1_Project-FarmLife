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
const hologramOverlay = document.getElementById('hologramOverlay');
const dataPoint1 = document.getElementById('dataPoint1');
const dataPoint2 = document.getElementById('dataPoint2');
const dataPoint3 = document.getElementById('dataPoint3');

let map;
let southAfricaLayer;
let trailPoints = [];
let mlAlerts = [];

const trackedAnimals = {
  'Milo 18': {
    battery: 72,
    speed: 14,
    path: [
      { lat: -26.218, lng: 28.031, heading: 42, area: 'Pretoria Grazing Zone', direction: 'northeast' },
      { lat: -25.993, lng: 28.140, heading: 58, area: 'Bronkhorstspruit Waterhole', direction: 'east' },
      { lat: -25.910, lng: 28.210, heading: 72, area: 'Lyttelton Ridge', direction: 'east' },
      { lat: -25.835, lng: 28.330, heading: 88, area: 'Elandsfontein Stream', direction: 'east' }
    ],
    index: 0,
    marker: null,
    route: null
  },
  'Bessie 04': {
    battery: 88,
    speed: 8,
    path: [
      { lat: -29.115, lng: 26.190, heading: 215, area: 'Bloemfontein Pasture', direction: 'southwest' },
      { lat: -29.180, lng: 26.075, heading: 200, area: 'Vechtkop Ridge', direction: 'southwest' },
      { lat: -29.240, lng: 26.020, heading: 188, area: 'Hartford Dam', direction: 'south' }
    ],
    index: 0,
    marker: null,
    route: null
  },
  'Karoo 12': {
    battery: 64,
    speed: 11,
    path: [
      { lat: -30.874, lng: 24.734, heading: 110, area: 'Karoo South Meadow', direction: 'southeast' },
      { lat: -31.030, lng: 24.845, heading: 120, area: 'Valley Ridge', direction: 'southeast' },
      { lat: -31.190, lng: 24.935, heading: 95, area: 'Saltpan Track', direction: 'east' }
    ],
    index: 0,
    marker: null,
    route: null
  }
};

let activeAnimal = 'Milo 18';

const activityEvents = [
  'Bessie 04 entered North Pasture',
  'Water Station ping received at Karoo Farm',
  'Community theft report updated',
  'New stock logged in Inventory',
  'Analytics dashboard refreshed',
  'Security alert triaged',
  'Veterinary health check scheduled',
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

async function initializeMap() {
  if (!mapElement) return;
  map = L.map('map', {
    center: [-30.0, 24.0],
    zoom: 5,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 4,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  try {
    const response = await fetch('https://nominatim.openstreetmap.org/search?country=South+Africa&format=json&polygon_geojson=1');
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0 && data[0].geojson) {
      southAfricaLayer = L.geoJSON(data[0].geojson, {
        style: {
          color: '#0f172a',
          weight: 2,
          fillColor: '#2563eb',
          fillOpacity: 0.08
        }
      }).addTo(map);
      map.fitBounds(southAfricaLayer.getBounds(), { padding: [40, 40] });
    }
  } catch (error) {
    console.warn('SA boundary load failed:', error);
  }
}

function formatAnimalIcon(animalName, isActive, heading) {
  const rotation = heading || 0;
  return L.divIcon({
    className: `animal-marker${isActive ? ' active' : ''}`,
    html: `
      <div class="marker-body"></div>
      <div class="marker-arrow" style="transform: translateX(-50%) rotate(${rotation}deg);"></div>
      <div class="marker-label">${animalName}</div>
    `,
    iconSize: [90, 90],
    iconAnchor: [45, 45]
  });
}

function createAnimalMarker(animalName) {
  const animal = trackedAnimals[animalName];
  if (!animal || !map) return;
  const step = animal.path[animal.index];
  animal.marker = L.marker([step.lat, step.lng], {
    icon: formatAnimalIcon(animalName, animalName === activeAnimal, step.heading)
  }).addTo(map).bindPopup(`<strong>${animalName}</strong><br>${step.area}`);

  animal.route = L.polyline(animal.path.map(step => [step.lat, step.lng]), {
    color: animalName === activeAnimal ? '#f59e0b' : '#2563eb',
    weight: animalName === activeAnimal ? 4.5 : 3,
    opacity: animalName === activeAnimal ? 0.95 : 0.65,
    dashArray: '8,6'
  }).addTo(map);
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

function renderAnimalMarkers() {
  if (!map) return;
  Object.keys(trackedAnimals).forEach(animalName => {
    const animal = trackedAnimals[animalName];
    if (!animal.marker) {
      createAnimalMarker(animalName);
    }
  });
}

function updateMarkerPositions() {
  Object.entries(trackedAnimals).forEach(([animalName, animal]) => {
    const prevIndex = animal.index;
    animal.index = (animal.index + 1) % animal.path.length;
    const step = animal.path[animal.index];
    const prevStep = animal.path[prevIndex];

    if (animal.marker) {
      animal.marker.setLatLng([step.lat, step.lng]);
      animal.marker.setIcon(formatAnimalIcon(animalName, animalName === activeAnimal, step.heading));
      animal.marker.getPopup().setContent(`<strong>${animalName}</strong><br>${step.area}`);
    }

    if (animal.route) {
      animal.route.setStyle({
        color: animalName === activeAnimal ? '#f59e0b' : '#2563eb',
        weight: animalName === activeAnimal ? 4.5 : 3,
        opacity: animalName === activeAnimal ? 0.95 : 0.65
      });
    }

    // Create trail point for active animal
    if (animalName === activeAnimal && prevStep) {
      createTrailPoint(prevStep.lat, prevStep.lng);
    }

    // ML Alert for anomalies
    if (animal.speed > 18 && Math.random() > 0.7) {
      createMLAlert(step.lat, step.lng, '⚠️ Speed Anomaly');
    } else if (animal.battery < 25 && Math.random() > 0.8) {
      createMLAlert(step.lat, step.lng, '🔋 Battery Critical');
    }

    if (animalName === activeAnimal) {
      trackerCaption.textContent = `Heading ${step.direction} toward ${step.area} • Speed ${animal.speed} km/h • Battery ${animal.battery}%`;
      mapStatus.textContent = `${animalName} pinged from ${step.area}`;
      if (animal.marker) {
        animal.marker.openPopup();
      }
      updateHologramData();
    }
  });
}

function setActiveTracker(animalName) {
  if (!trackedAnimals[animalName]) return;
  activeAnimal = animalName;
  renderTrackerButtons();
  updateMarkerPositions();
  updateHologramData();
}

function createTrailPoint(lat, lng) {
  if (!map) return;
  const trailPoint = L.circleMarker([lat, lng], {
    color: '#3b82f6',
    fillColor: '#3b82f6',
    fillOpacity: 0.6,
    radius: 3,
    className: 'trail-point'
  }).addTo(map);
  trailPoints.push(trailPoint);

  // Remove old trail points after 10 seconds
  setTimeout(() => {
    if (trailPoint && map.hasLayer(trailPoint)) {
      map.removeLayer(trailPoint);
    }
    trailPoints = trailPoints.filter(p => p !== trailPoint);
  }, 10000);
}

function createMLAlert(lat, lng, message) {
  if (!map) return;
  const alertDiv = document.createElement('div');
  alertDiv.className = 'ml-alert';
  alertDiv.textContent = message;
  alertDiv.style.left = '50%';
  alertDiv.style.top = '50%';
  alertDiv.style.transform = 'translate(-50%, -50%)';

  const alertMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'ml-alert-marker',
      html: alertDiv.outerHTML,
      iconSize: [120, 40],
      iconAnchor: [60, 20]
    })
  }).addTo(map);

  mlAlerts.push(alertMarker);

  // Remove alert after 8 seconds
  setTimeout(() => {
    if (alertMarker && map.hasLayer(alertMarker)) {
      map.removeLayer(alertMarker);
    }
    mlAlerts = mlAlerts.filter(a => a !== alertMarker);
  }, 8000);
}

function updateHologramData() {
  if (!dataPoint1 || !dataPoint2 || !dataPoint3) return;

  const animal = trackedAnimals[activeAnimal];
  if (!animal) return;

  const step = animal.path[animal.index];
  const speed = animal.speed;
  const battery = animal.battery;

  // AI Analysis
  let analysis = 'Normal Pattern';
  if (speed > 16) analysis = 'High Speed Detected';
  else if (speed < 6) analysis = 'Slow Movement';
  else if (battery < 30) analysis = 'Low Battery Warning';

  dataPoint1.textContent = `AI Analysis: ${analysis}`;

  // Battery Levels
  let batteryStatus = 'Optimal';
  if (battery < 20) batteryStatus = 'Critical';
  else if (battery < 50) batteryStatus = 'Low';

  dataPoint2.textContent = `Battery Levels: ${batteryStatus} (${battery}%)`;

  // Weather Impact (simulated)
  const weatherImpacts = ['Minimal', 'Moderate Wind', 'Heavy Rain', 'Clear Skies'];
  const weather = weatherImpacts[Math.floor(Math.random() * weatherImpacts.length)];

  dataPoint3.textContent = `Weather Impact: ${weather}`;
}

function drawLineChart(canvas, labels, values) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 50;
  const maxVal = Math.max(...values) + 15;

  // Clear and setup
  ctx.clearRect(0, 0, width, height);

  // Background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#f8fafc');
  bgGradient.addColorStop(1, '#ffffff');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Weekly Health Trends', width / 2, 25);
  ctx.textAlign = 'left';

  // Grid lines with subtle gradient
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding + ((height - padding * 2) / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // Fill area under the line
  const lineGradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  lineGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
  lineGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
  ctx.fillStyle = lineGradient;
  ctx.beginPath();

  values.forEach((value, index) => {
    const x = padding + ((width - padding * 2) / (values.length - 1)) * index;
    const y = height - padding - ((height - padding * 2) * value) / maxVal;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(padding, height - padding);
  ctx.closePath();
  ctx.fill();

  // Main line with glow effect
  ctx.shadowColor = '#3b82f6';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();

  values.forEach((value, index) => {
    const x = padding + ((width - padding * 2) / (values.length - 1)) * index;
    const y = height - padding - ((height - padding * 2) * value) / maxVal;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  // Reset shadow
  ctx.shadowBlur = 0;

  // Data points with glow
  values.forEach((value, index) => {
    const x = padding + ((width - padding * 2) / (values.length - 1)) * index;
    const y = height - padding - ((height - padding * 2) * value) / maxVal;

    // Outer glow
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Inner point
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Labels with better styling
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px Inter, sans-serif';
  values.forEach((value, index) => {
    const x = padding + ((width - padding * 2) / (values.length - 1)) * index;
    const y = height - padding + 25;
    ctx.fillText(labels[index], x - 15, y);
  });

  // Y-axis labels
  ctx.fillStyle = '#64748b';
  ctx.font = '11px Inter, sans-serif';
  for (let i = 0; i <= 5; i++) {
    const value = Math.round((maxVal / 5) * (5 - i));
    const y = padding + ((height - padding * 2) / 5) * i + 4;
    ctx.fillText(value.toString(), 10, y);
  }
}

function drawBarChart(canvas, labels, values) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 50;
  const barWidth = (width - padding * 2) / values.length - 12;
  const maxVal = Math.max(...values) + 3;

  // Clear and setup
  ctx.clearRect(0, 0, width, height);

  // Background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#f8fafc');
  bgGradient.addColorStop(1, '#ffffff');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Inventory Alert Summary', width / 2, 25);
  ctx.textAlign = 'left';

  // Grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding + ((height - padding * 2) / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // Draw bars with gradients and animations
  values.forEach((value, index) => {
    const x = padding + index * (barWidth + 12) + 6;
    const barHeight = ((height - padding * 2) * value) / maxVal;
    const y = height - padding - barHeight;

    // Bar gradient
    const barGradient = ctx.createLinearGradient(0, y, 0, height - padding);
    barGradient.addColorStop(0, '#f59e0b');
    barGradient.addColorStop(1, '#d97706');

    // Bar shadow/glow
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.fillStyle = barGradient;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Reset shadow
    ctx.shadowBlur = 0;

    // Bar border
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x, y, barWidth, 4);

    // Value label on top of bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), x + barWidth / 2, y - 8);

    // Reset text align
    ctx.textAlign = 'left';
  });

  // X-axis labels
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px Inter, sans-serif';
  values.forEach((value, index) => {
    const x = padding + index * (barWidth + 12) + 6 + barWidth / 2;
    const y = height - padding + 25;
    ctx.fillText(labels[index], x - 15, y);
  });

  // Y-axis labels
  ctx.fillStyle = '#64748b';
  ctx.font = '11px Inter, sans-serif';
  for (let i = 0; i <= 5; i++) {
    const value = Math.round((maxVal / 5) * (5 - i));
    const y = padding + ((height - padding * 2) / 5) * i + 4;
    ctx.fillText(value.toString(), 10, y);
  }
}

function getHealthData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseValues = [78, 82, 75, 88, 91, 85, 89];
  const values = baseValues.map(val => val + randomValue(-5, 5));
  return { labels: days, values };
}

function getInventoryData() {
  const categories = ['Feed', 'Fuel', 'Fertilizer', 'Medicine', 'Tools'];
  const baseValues = [3, 7, 2, 5, 4];
  const values = baseValues.map(val => Math.max(1, val + randomValue(-2, 2)));
  return { labels: categories, values };
}

const healthCanvas = document.getElementById('healthChart');
const inventoryCanvas = document.getElementById('inventoryChart');

// Tooltip functionality
let tooltip = null;

function createTooltip() {
  if (tooltip) return;
  tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: rgba(15, 23, 42, 0.95);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    pointer-events: none;
    z-index: 1000;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(59, 130, 246, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    opacity: 0;
    transition: opacity 0.2s ease;
  `;
  document.body.appendChild(tooltip);
}

function showTooltip(x, y, text) {
  if (!tooltip) createTooltip();
  tooltip.textContent = text;
  tooltip.style.left = x + 10 + 'px';
  tooltip.style.top = y - 10 + 'px';
  tooltip.style.opacity = '1';
}

function hideTooltip() {
  if (tooltip) {
    tooltip.style.opacity = '0';
  }
}

function addChartInteractivity(canvas, labels, values, chartType) {
  const rect = canvas.getBoundingClientRect();
  let isHovering = false;

  canvas.addEventListener('mousemove', (e) => {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const padding = 50;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    if (x < padding || x > canvas.width - padding || y < padding || y > canvas.height - padding) {
      hideTooltip();
      isHovering = false;
      canvas.style.cursor = 'default';
      return;
    }

    isHovering = true;
    canvas.style.cursor = 'crosshair';

    if (chartType === 'line') {
      const dataIndex = Math.round(((x - padding) / chartWidth) * (values.length - 1));
      if (dataIndex >= 0 && dataIndex < values.length) {
        const value = values[dataIndex];
        const label = labels[dataIndex];
        showTooltip(e.clientX, e.clientY, `${label}: ${value}% Health Score`);
      }
    } else if (chartType === 'bar') {
      const barWidth = chartWidth / values.length - 12;
      const barIndex = Math.floor(((x - padding) / chartWidth) * values.length);
      if (barIndex >= 0 && barIndex < values.length) {
        const value = values[barIndex];
        const label = labels[barIndex];
        showTooltip(e.clientX, e.clientY, `${label}: ${value} alerts`);
      }
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hideTooltip();
    isHovering = false;
    canvas.style.cursor = 'default';
  });
}

function renderCharts() {
  const healthData = getHealthData();
  const inventoryData = getInventoryData();

  // Add fade effect before redrawing
  if (healthCanvas) {
    healthCanvas.style.opacity = '0.7';
    setTimeout(() => {
      drawLineChart(healthCanvas, healthData.labels, healthData.values);
      healthCanvas.style.opacity = '1';
      addChartInteractivity(healthCanvas, healthData.labels, healthData.values, 'line');
    }, 150);
  }

  if (inventoryCanvas) {
    inventoryCanvas.style.opacity = '0.7';
    setTimeout(() => {
      drawBarChart(inventoryCanvas, inventoryData.labels, inventoryData.values);
      inventoryCanvas.style.opacity = '1';
      addChartInteractivity(inventoryCanvas, inventoryData.labels, inventoryData.values, 'bar');
    }, 150);
  }
}

async function initializeDashboard() {
  setActiveNavLink();
  await initializeMap();
  updateMetrics();
  addActivityEvent();
  renderTrackerButtons();
  renderAnimalMarkers();
  setActiveTracker(activeAnimal);
  updateHologramData();
  renderCharts();
  addChartInteractivity(healthCanvas, getHealthData().labels, getHealthData().values, 'line');
  addChartInteractivity(inventoryCanvas, getInventoryData().labels, getInventoryData().values, 'bar');

  setInterval(() => {
    updateMarkerPositions();
    addActivityEvent();
    updateMetrics();
    renderCharts();
  }, 5000);
}

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

document.addEventListener('DOMContentLoaded', initializeDashboard);