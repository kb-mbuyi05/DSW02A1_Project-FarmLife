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

const INCIDENT_HEAT_POINTS = [
  [-33.0153, 27.9116, 1.0], // Eastern Cape hotspot
  [-29.127, 26.2041, 0.35], // Free State
  [-25.7479, 28.2293, 0.45], // Gauteng
  [-29.8587, 31.0218, 0.25], // KwaZulu-Natal
  [-33.9249, 18.4241, 0.20]  // Western Cape
];

const HOTSPOT_COORDS = [-33.0153, 27.9116];

let theftMap;
let theftHeatLayer;

function initializeCharts() {
  const growthCtx = document.getElementById('growthChart')?.getContext('2d');
  if (growthCtx) {
    new Chart(growthCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Actual Count',
            data: [400, 420, 450, 460, 470, 482],
            backgroundColor: '#1d4ed8',
            borderRadius: 8,
            order: 2
          },
          {
            label: 'Projected Count',
            data: [410, 430, 500, 520, 540, 560],
            backgroundColor: '#f59e0b',
            borderRadius: 8,
            order: 2
          },
          {
            label: 'Efficiency %',
            data: [90, 92, 94, 95, 96, 97],
            type: 'line',
            borderColor: '#10b981',
            borderWidth: 3,
            fill: false,
            order: 1,
            pointBackgroundColor: '#10b981',
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  const securityCtx = document.getElementById('securityChart')?.getContext('2d');
  if (securityCtx) {
    new Chart(securityCtx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Theft Incidents',
            data: [12, 9, 15, 11],
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            borderWidth: 3,
            fill: true,
            pointBackgroundColor: '#dc2626',
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

function initializeHeatmap() {
  if (!window.L) return;
  const mapElement = document.getElementById('heatmap');
  if (!mapElement) return;

  theftMap = L.map('heatmap', {
    center: [-29.0, 24.0],
    zoom: 5,
    minZoom: 5,
    maxZoom: 9,
    maxBounds: [[-35.5, 16.5], [-21.5, 33.0]],
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(theftMap);

  theftHeatLayer = L.heatLayer(INCIDENT_HEAT_POINTS, {
    radius: 28,
    blur: 24,
    maxZoom: 10,
    gradient: {
      0.0: '#22c55e',
      0.25: '#4ade80',
      0.45: '#bef264',
      0.65: '#facc15',
      0.85: '#f97316',
      1.0: '#dc2626'
    }
  }).addTo(theftMap);

  theftMap.setView(HOTSPOT_COORDS, 6);
  L.circle(HOTSPOT_COORDS, {
    radius: 42000,
    color: '#dc2626',
    fillColor: 'rgba(220, 38, 38, 0.18)',
    fillOpacity: 0.25,
    weight: 2
  }).addTo(theftMap).bindPopup('Eastern Cape hotspot - danger zone');
}

function initializeForumBackButton() {
  const forumButton = document.getElementById('forumBackButton');
  if (!forumButton) return;

  const userRole = localStorage.getItem('farmLifeUserRole');
  if (userRole === 'community') {
    forumButton.style.display = 'inline-flex';
    forumButton.addEventListener('click', function() {
      window.location.href = '../Report-Theft_Page/stockthefr_forum.html';
    });
  } else {
    forumButton.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setActiveNavLink();
  initializeCharts();
  initializeHeatmap();
  initializeForumBackButton();
});
