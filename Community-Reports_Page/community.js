const STORAGE_KEY = 'communityReports';

const defaultReports = [
  {
    id: 'report-1',
    title: 'Piet Viljoen — 12 Cattle Stolen',
    reporter: 'Piet Viljoen',
    animal: 'Cattle',
    location: 'Balfour District, Mpumalanga',
    description: 'Brahman-cross herd taken from North pasture. Fence cut at R23. Blue Toyota Hilux seen in area.',
    status: 'Verified',
    verifier: 'Officer Tshabalala',
    createdAt: '2026-05-01T07:45:00',
    trustLevel: 'trusted',
    urgent: true,
    comments: [
      { id: 'comment-1', author: 'Community', text: 'Possible vehicle sighting confirmed by a neighbor.', createdAt: '2026-05-01T08:10:00' }
    ],
    updates: [
      { id: 'update-1', author: 'Piet Viljoen', text: 'Spotted fresh tracks along the northern fence line.', createdAt: '2026-05-01T09:15:00' }
    ],
    images: [],
    lat: -26.483,
    lng: 29.107
  },
  {
    id: 'report-2',
    title: 'Sarah Moloi — 45 Sheep Stolen',
    reporter: 'Sarah Moloi',
    animal: 'Sheep',
    location: 'Harrismith, Free State',
    description: 'Merino sheep missing after night storm. Tracks heading towards mountain pass.',
    status: 'Pending',
    verifier: '',
    createdAt: '2026-05-02T16:20:00',
    trustLevel: 'community',
    urgent: false,
    comments: [],
    updates: [],
    images: [],
    lat: -28.281,
    lng: 29.121
  },
  {
    id: 'report-3',
    title: 'David Ngwenya — 8 Goats Stolen',
    reporter: 'David Ngwenya',
    animal: 'Goats',
    location: 'Ladysmith Outskirts, KZN',
    description: 'Small group of Boer goats taken from kraal. Recovered 5km away thanks to community tip.',
    status: 'Resolved',
    verifier: 'Local patrol',
    createdAt: '2026-05-03T10:05:00',
    trustLevel: 'trusted',
    urgent: false,
    comments: [
      { id: 'comment-2', author: 'Local patrol', text: 'Five goats recovered and returned to the owner.', createdAt: '2026-05-03T12:40:00' }
    ],
    updates: [
      { id: 'update-2', author: 'Community', text: 'Recovery in progress thanks to local tip-offs.', createdAt: '2026-05-03T11:10:00' }
    ],
    images: [],
    lat: -28.556,
    lng: 29.786
  }
];

function loadReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultReports;
  } catch (error) {
    return defaultReports;
  }
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function highlightNavLink() {
  document.querySelectorAll('nav a').forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function createId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getStatusClass(status) {
  return status.toLowerCase();
}

function getTrustLabel(level) {
  switch (level) {
    case 'trusted': return 'Trusted reporter';
    case 'community': return 'Community verified';
    default: return 'New contributor';
  }
}

function getTrustClass(level) {
  switch (level) {
    case 'trusted': return 'trusted';
    case 'community': return 'community';
    default: return 'new';
  }
}

function updateStats(reports) {
  const total = reports.length;
  const verified = reports.filter(item => item.status === 'Verified').length;
  const active = reports.filter(item => item.status !== 'Resolved').length;
  const verifiedPercent = total ? Math.round((verified / total) * 100) : 0;

  const stats = document.getElementById('communityStats');
  if (!stats) return;
  stats.innerHTML = `
    <span><strong>${total}</strong> Reports</span>
    <span><strong>${verifiedPercent}%</strong> Verified</span>
    <span><strong>${active}</strong> Active Alerts</span>
  `;
}

function updateAnalytics(reports) {
  const total = reports.length;
  const verified = reports.filter(item => item.status === 'Verified').length;
  const active = reports.filter(item => item.status !== 'Resolved').length;
  const notes = reports.reduce((sum, item) => sum + (item.comments?.length || 0), 0);

  document.getElementById('analyticsTotal').textContent = total;
  document.getElementById('analyticsVerified').textContent = verified;
  document.getElementById('analyticsActive').textContent = active;
  document.getElementById('analyticsNotes').textContent = notes;
}

function updateAlertBanner(reports) {
  const pending = reports.filter(item => item.status === 'Pending').length;
  const text = pending
    ? `There are ${pending} active reports awaiting verification. Please review and share updates.`
    : 'There are no active alerts right now. Your community is up to date.';
  document.getElementById('alertBannerText').textContent = text;
}

function initMap() {
  const mapContainer = document.getElementById('communityMap');
  if (!mapContainer) return null;

  mapContainer.style.minHeight = '420px';
  mapContainer.style.width = '100%';
  mapContainer.style.position = 'relative';

  if (typeof L === 'undefined') {
    mapContainer.innerHTML = '<div class="map-error">Map library failed to load. Check your connection or refresh the page.</div>';
    return null;
  }

  // Initialize map centered on South Africa with appropriate zoom
  const map = L.map(mapContainer).setView([-28.5, 24.7], 6);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    // Restrict zoom levels to keep focus on South Africa
    minZoom: 5,
    maxZoom: 12
  }).addTo(map);

  // Set max bounds to roughly cover South Africa and surrounding areas
  const southWest = L.latLng(-35, 15);
  const northEast = L.latLng(-22, 35);
  const bounds = L.latLngBounds(southWest, northEast);
  map.setMaxBounds(bounds);
  map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
  });

  map.whenReady(() => {
    setTimeout(() => map.invalidateSize(), 100);
  });

  const markerLayer = L.layerGroup().addTo(map);
  return { map, markerLayer };
}

function getMapIcon(status) {
  const color = status === 'Verified' ? '#16a34a' : status === 'Resolved' ? '#2563eb' : '#f59e0b';
  return L.divIcon({
    className: 'custom-marker',
    html: `<span style="background:${color};border:2px solid white;border-radius:50%;width:18px;height:18px;display:block;box-shadow:0 0 0 3px rgba(0,0,0,0.12);"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18]
  });
}

async function geocodeLocation(location) {
  if (!location) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`;
    const response = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const results = await response.json();
    if (!results.length) return null;
    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon)
    };
  } catch (error) {
    return null;
  }
}

function getProvinceFromLocation(location) {
  const locationLower = location.toLowerCase();
  
  // South African provinces mapping
  if (locationLower.includes('western cape') || locationLower.includes('cape town')) return 'Western Cape';
  if (locationLower.includes('eastern cape') || locationLower.includes('port elizabeth') || locationLower.includes('east london')) return 'Eastern Cape';
  if (locationLower.includes('northern cape') || locationLower.includes('kimberley')) return 'Northern Cape';
  if (locationLower.includes('free state') || locationLower.includes('bloemfontein') || locationLower.includes('harrismith')) return 'Free State';
  if (locationLower.includes('kzn') || locationLower.includes('kwazulu') || locationLower.includes('natal') || locationLower.includes('durban') || locationLower.includes('ladysmith')) return 'KwaZulu-Natal';
  if (locationLower.includes('north west') || locationLower.includes('mafikeng')) return 'North West';
  if (locationLower.includes('gauteng') || locationLower.includes('johannesburg') || locationLower.includes('pretoria')) return 'Gauteng';
  if (locationLower.includes('mpumalanga') || locationLower.includes('nelspruit') || locationLower.includes('balfour')) return 'Mpumalanga';
  if (locationLower.includes('limpopo') || locationLower.includes('polokwane')) return 'Limpopo';
  
  return 'Unknown';
}

function getProvinceCoordinates(province) {
  const coords = {
    'Western Cape': [-33.9249, 18.4241],
    'Eastern Cape': [-32.2968, 26.4194],
    'Northern Cape': [-29.0467, 21.8569],
    'Free State': [-28.4541, 26.7968],
    'KwaZulu-Natal': [-28.5306, 30.8958],
    'North West': [-25.7313, 25.7494],
    'Gauteng': [-26.2708, 28.1123],
    'Mpumalanga': [-25.5657, 30.5279],
    'Limpopo': [-23.4013, 29.4179]
  };
  return coords[province] || [-28.5, 24.7]; // Default to center of South Africa
}

function calculateProvinceDensity(reports) {
  const provinceCounts = {};
  
  reports.forEach(report => {
    const province = getProvinceFromLocation(report.location);
    provinceCounts[province] = (provinceCounts[province] || 0) + 1;
  });
  
  return provinceCounts;
}

function getDensityColor(count) {
  if (count >= 5) return '#dc2626'; // Red - Very High Risk
  if (count >= 3) return '#ea580c'; // Orange - High Risk  
  if (count >= 2) return '#ca8a04'; // Yellow - Medium Risk
  if (count >= 1) return '#16a34a'; // Green - Low Risk
  return '#6b7280'; // Gray - No incidents
}

function getDensityLabel(count) {
  if (count >= 5) return 'Very High Risk';
  if (count >= 3) return 'High Risk';
  if (count >= 2) return 'Medium Risk';
  if (count >= 1) return 'Low Risk';
  return 'No Incidents';
}

function renderMapMarkers(reports, markerLayer, map) {
  if (!markerLayer || !map) return;
  markerLayer.clearLayers();

  // Calculate province density
  const provinceDensity = calculateProvinceDensity(reports);
  
  // Add province markers with density-based coloring
  Object.entries(provinceDensity).forEach(([province, count]) => {
    const coords = getProvinceCoordinates(province);
    const color = getDensityColor(count);
    const riskLabel = getDensityLabel(count);
    
    // Create custom icon with color
    const icon = L.divIcon({
      className: 'province-marker',
      html: `<div style="background-color: ${color}; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">${count}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    const marker = L.marker(coords, { icon });
    marker.bindPopup(`
      <strong>${province}</strong><br>
      <span style="color: ${color}">● ${riskLabel}</span><br>
      ${count} incident${count !== 1 ? 's' : ''} reported
    `);
    marker.addTo(markerLayer);
  });

  // Add individual incident markers
  const coords = [];
  reports.forEach(report => {
    if (typeof report.lat !== 'number' || typeof report.lng !== 'number') return;

    const marker = L.marker([report.lat, report.lng], { icon: getMapIcon(report.status) });
    marker.bindPopup(`
      <strong>${report.title}</strong><br>
      ${report.animal} — ${report.location}<br>
      Status: ${report.status}
    `);
    marker.addTo(markerLayer);
    coords.push([report.lat, report.lng]);
  });

  // Fit map to show all markers, but keep within South Africa bounds
  const allCoords = [...Object.values(provinceDensity).map((_, province) => getProvinceCoordinates(province)), ...coords];
  if (allCoords.length === 1) {
    map.setView(allCoords[0], 8);
  } else if (allCoords.length > 1) {
    const bounds = L.latLngBounds(allCoords);
    // Ensure bounds don't extend too far outside South Africa
    const saBounds = L.latLngBounds([-35, 15], [-22, 35]);
    const constrainedBounds = bounds.intersect(saBounds) || bounds;
    map.fitBounds(constrainedBounds, { padding: [20, 20], maxZoom: 10 });
  } else {
    // No markers, reset to South Africa center
    map.setView([-28.5, 24.7], 6);
  }
}

function buildImageGallery(images) {
  if (!images?.length) return '';
  return `
    <div class="detail-block">
      <h4>Evidence photos</h4>
      <div class="image-grid">
        ${images.map(src => `<img class="report-image" src="${src}" alt="Evidence image">`).join('')}
      </div>
    </div>
  `;
}

function buildReportCard(report) {
  const commentCount = report.comments?.length || 0;
  const updateCount = report.updates?.length || 0;
  const latestUpdate = report.updates?.length ? report.updates[report.updates.length - 1] : null;

  return `
    <div class="incident-card ${getStatusClass(report.status)}" data-id="${report.id}">
      <div class="card-header">
        <div>
          <h3>${report.title}</h3>
          <span class="status-badge ${getStatusClass(report.status)}">${report.status}</span>
        </div>
        <div class="card-actions">
          <button type="button" class="action-btn view-incident-btn">View Incident</button>
          <button type="button" class="action-btn update-btn">Add note</button>
          <button type="button" class="action-btn share-btn">Share</button>
          <button type="button" class="action-btn edit-btn">Edit</button>
          <button type="button" class="action-btn delete-btn">Delete</button>
        </div>
      </div>

      <div class="card-meta">
        <span class="trust-badge ${getTrustClass(report.trustLevel)}">${getTrustLabel(report.trustLevel)}</span>
        <span class="report-time">Reported ${formatDate(report.createdAt)}</span>
        ${report.verifier ? `<span class="verified-by">Verified by ${report.verifier}</span>` : ''}
      </div>

      <p><strong>Reporter:</strong> ${report.reporter}</p>
      <p><strong>Location:</strong> ${report.location}</p>
      <p><strong>Animal:</strong> ${report.animal}</p>
      <p>${report.description}</p>

      <div class="card-summary">
        <span>${commentCount} notes</span>
        <span>${updateCount} updates</span>
        <span>${report.images?.length || 0} images</span>
      </div>

      ${buildImageGallery(report.images)}

      <div class="report-details hidden">
        <div class="detail-block">
          <h4>Latest update</h4>
          <p>${latestUpdate ? latestUpdate.text : 'No update has been added yet.'}</p>
        </div>
        <div class="detail-block">
          <h4>Recent notes</h4>
          ${commentCount ? report.comments.slice(-2).map(comment => `
            <div class="comment-item">
              <strong>${comment.author}</strong>
              <span>${formatDate(comment.createdAt)}</span>
              <p>${comment.text}</p>
            </div>
          `).join('') : '<p class="muted">No notes yet. Add a note to keep the community informed.</p>'}
        </div>
        <div class="comment-form hidden">
          <textarea class="comment-input" placeholder="Add a note for this incident"></textarea>
          <button type="button" class="action-btn save-comment-btn">Save note</button>
        </div>
      </div>
    </div>
  `;
}

function filterReports(reports, query, status, animal) {
  return reports.filter(report => {
    const normalized = `${report.title} ${report.reporter} ${report.animal} ${report.location} ${report.description} ${report.status}`.toLowerCase();
    const matchesQuery = !query || normalized.includes(query.toLowerCase());
    const matchesStatus = status === 'all' || report.status === status;
    const matchesAnimal = !animal || report.animal.toLowerCase().includes(animal.toLowerCase());
    return matchesQuery && matchesStatus && matchesAnimal;
  });
}

function sortReports(reports, sortOrder) {
  return [...reports].sort((a, b) => {
    if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === 'verified') {
      if (a.status === 'Verified' && b.status !== 'Verified') return -1;
      if (a.status !== 'Verified' && b.status === 'Verified') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortOrder === 'activity') {
      return (b.comments.length + b.updates.length) - (a.comments.length + a.updates.length);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function renderImagePreviews(images) {
  const previewList = document.getElementById('imagePreviewList');
  previewList.innerHTML = images.map(src => `<img class="preview-thumb" src="${src}" alt="Preview">`).join('');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2400);
}

function populateReportList(reports) {
  const reportList = document.getElementById('reportList');
  reportList.innerHTML = '';

  if (!reports.length) {
    reportList.innerHTML = '<div class="empty-state">No reports match your search and filters. Create or clear filters to view reports.</div>';
    return;
  }

  reportList.innerHTML = reports.map(buildReportCard).join('');
}

function setFormValues(report) {
  document.getElementById('reportTitle').value = report.title;
  document.getElementById('reportReporter').value = report.reporter;
  document.getElementById('reportAnimal').value = report.animal;
  document.getElementById('reportLocation').value = report.location;
  document.getElementById('reportDescription').value = report.description;
  document.getElementById('reportStatus').value = report.status;
  document.getElementById('reportVerifier').value = report.verifier || '';
  window.pendingImages = report.images ? [...report.images] : [];
  renderImagePreviews(window.pendingImages);
}

function resetForm() {
  document.getElementById('reportForm').reset();
  document.getElementById('reportImages').value = '';
  window.pendingImages = [];
  renderImagePreviews([]);
}

function closeForm() {
  const form = document.getElementById('reportForm');
  form.classList.add('hidden');
  document.getElementById('formTitle').textContent = 'Add new report';
}

function openForm(mode, report = null) {
  const form = document.getElementById('reportForm');
  form.classList.remove('hidden');
  document.getElementById('formTitle').textContent = mode === 'edit' ? 'Edit report' : 'Add new report';
  if (report) setFormValues(report);
  else resetForm();
}

function initCrud() {
  highlightNavLink();

  let reports = loadReports();
  let editingReportId = null;
  let currentQuery = '';
  let currentStatus = 'all';
  let currentAnimal = '';
  let currentSort = 'recent';
  window.pendingImages = [];

  const reportListEl = document.getElementById('reportList');
  const filterStatus = document.getElementById('filterStatus');
  const filterAnimal = document.getElementById('filterAnimal');
  const sortOrder = document.getElementById('sortOrder');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const reportImagesInput = document.getElementById('reportImages');
  const openFormBtn = document.getElementById('openFormBtn');
  const cancelFormBtn = document.getElementById('cancelFormBtn');
  const deleteConfirm = document.getElementById('deleteConfirm');
  const deleteReportTitle = document.getElementById('deleteReportTitle');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

  const mapInstance = initMap();
  window.mapInstance = mapInstance; // Make it globally accessible

  function refresh() {
    const filtered = sortReports(filterReports(reports, currentQuery, currentStatus, currentAnimal), currentSort);
    populateReportList(filtered);
    updateStats(reports);
    updateAnalytics(reports);
    updateAlertBanner(reports);
    if (window.mapInstance) renderMapMarkers(filtered, window.mapInstance.markerLayer, window.mapInstance.map);
  }

  openFormBtn.addEventListener('click', () => {
    editingReportId = null;
    resetForm();
    openForm('add');
  });

  cancelFormBtn.addEventListener('click', closeForm);

  reportImagesInput.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files);
    const previews = await Promise.all(files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    })));
    window.pendingImages = [...window.pendingImages, ...previews];
    renderImagePreviews(window.pendingImages);
  });

  clearFiltersBtn.addEventListener('click', () => {
    currentQuery = '';
    currentStatus = 'all';
    currentAnimal = '';
    currentSort = 'recent';
    filterStatus.value = 'all';
    filterAnimal.value = '';
    sortOrder.value = 'recent';
    refresh();
    showToast('Filters cleared.');
  });

  document.getElementById('reportForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('reportTitle').value.trim();
    const reporter = document.getElementById('reportReporter').value.trim();
    const animal = document.getElementById('reportAnimal').value.trim();
    const location = document.getElementById('reportLocation').value.trim();
    const description = document.getElementById('reportDescription').value.trim();
    const status = document.getElementById('reportStatus').value;
    const verifier = document.getElementById('reportVerifier').value.trim();

    let lat = null;
    let lng = null;
    const currentReport = editingReportId ? reports.find(item => item.id === editingReportId) : null;
    if (currentReport && currentReport.location === location && typeof currentReport.lat === 'number' && typeof currentReport.lng === 'number') {
      lat = currentReport.lat;
      lng = currentReport.lng;
    } else {
      const geocodeResult = await geocodeLocation(location);
      if (geocodeResult) {
        lat = geocodeResult.lat;
        lng = geocodeResult.lng;
      }
    }

    const newItem = {
      id: editingReportId || createId('report'),
      title,
      reporter,
      animal,
      location,
      description,
      status,
      verifier,
      createdAt: editingReportId ? currentReport.createdAt : new Date().toISOString(),
      trustLevel: editingReportId ? currentReport.trustLevel : 'new',
      comments: editingReportId ? currentReport.comments : [],
      updates: editingReportId ? currentReport.updates : [],
      images: window.pendingImages || [],
      lat,
      lng
    };

    if (editingReportId) {
      reports = reports.map(report => report.id === editingReportId ? newItem : report);
      showToast('Report updated successfully.');
    } else {
      reports.unshift(newItem);
      showToast('New report created successfully.');
    }

    saveReports(reports);
    refresh();
    closeForm();
  });

  let pendingDeleteId = null;

  function showDeleteConfirm(report) {
    pendingDeleteId = report.id;
    deleteReportTitle.textContent = report.title;
    deleteConfirm.classList.remove('hidden');
  }

  function hideDeleteConfirm() {
    pendingDeleteId = null;
    deleteConfirm.classList.add('hidden');
  }

  reportListEl.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const card = button.closest('.incident-card');
    if (!card) return;

    const reportId = card.dataset.id;
    const report = reports.find(item => item.id === reportId);
    if (!report) return;

    if (button.classList.contains('edit-btn')) {
      editingReportId = reportId;
      openForm('edit', report);
      return;
    }

    if (button.classList.contains('delete-btn')) {
      showDeleteConfirm(report);
      return;
    }

    if (button.classList.contains('view-incident-btn')) {
      // Get the province from the report location
      const province = getProvinceFromLocation(report.location);

      // Find the most recent incident in this province
      const provinceReports = reports.filter(r => getProvinceFromLocation(r.location) === province);
      const mostRecentReport = provinceReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      if (mostRecentReport) {
        // Scroll to the most recent incident card
        const targetCard = document.querySelector(`.incident-card[data-id="${mostRecentReport.id}"]`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the card temporarily
          targetCard.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
          setTimeout(() => {
            targetCard.style.boxShadow = '';
          }, 3000);
          showToast(`Showing most recent incident in ${province}`);
        }
      } else {
        showToast(`No incidents found in ${province}`);
      }
      return;
    }

    if (button.classList.contains('update-btn')) {
      const commentForm = card.querySelector('.comment-form');
      commentForm.classList.toggle('hidden');
      return;
    }

    if (button.classList.contains('share-btn')) {
      const shareText = `${report.title}\n${report.location}\nStatus: ${report.status}\n${report.description}`;
      if (navigator.share) {
        navigator.share({ title: report.title, text: shareText }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => showToast('Report details copied to clipboard.'));
      } else {
        showToast('Sharing is not supported by this browser.');
      }
      return;
    }

    if (button.classList.contains('save-comment-btn')) {
      const textarea = card.querySelector('.comment-input');
      const text = textarea.value.trim();
      if (!text) {
        showToast('Enter a note before saving.');
        return;
      }
      report.comments = report.comments || [];
      report.comments.push({ id: createId('comment'), author: 'Community member', text, createdAt: new Date().toISOString() });
      reports = reports.map(item => item.id === reportId ? report : item);
      saveReports(reports);
      refresh();
      showToast('Community note added.');
      return;
    }
  });

  confirmDeleteBtn.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    reports = reports.filter(item => item.id !== pendingDeleteId);
    saveReports(reports);
    refresh();
    hideDeleteConfirm();
    showToast('Report deleted successfully.');
  });

  cancelDeleteBtn.addEventListener('click', hideDeleteConfirm);

  filterStatus.addEventListener('change', (event) => {
    currentStatus = event.target.value;
    refresh();
  });

  filterAnimal.addEventListener('input', (event) => {
    currentAnimal = event.target.value.trim();
    refresh();
  });

  sortOrder.addEventListener('change', (event) => {
    currentSort = event.target.value;
    refresh();
  });

  refresh();
}

window.addEventListener('DOMContentLoaded', initCrud);
