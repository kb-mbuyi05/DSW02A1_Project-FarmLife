const ZOO_API_SOURCES = [
  "https://zoo-animal-api.herokuapp.com/animals/rand/10",
  "https://zoo-animal-api.vercel.app/animals/rand/10",
  "https://api.allorigins.win/raw?url=https://zoo-animal-api.herokuapp.com/animals/rand/10",
  "https://api.allorigins.win/raw?url=https://zoo-animal-api.vercel.app/animals/rand/10"
];
const GBIF_API_URL = "https://api.gbif.org/v1/species/match?name=";
const WIKI_API_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=";

const DEFAULT_ANIMAL_IMAGE = query => `https://source.unsplash.com/featured/320x320/?${encodeURIComponent(query)}`;

const BREED_IMAGE_MAP = {
  Brahman: '../Brahman _ Cattle, Breed, Heat Tolerance, Adaptability, & Facts _ Britannica_files/Brahman-cow-cattle.jpg',
  Angus: '../Brahman _ Cattle, Breed, Heat Tolerance, Adaptability, & Facts _ Britannica_files/Angus-cattle.jpg',
  Hereford: 'Hereford_cow,_Souris,_Prince_Edward_Island.jpg',
  Dorper: 'dorper.webp',
  Nguni: '../Brahman _ Cattle, Breed, Heat Tolerance, Adaptability, & Facts _ Britannica_files/Brahman-cow-cattle(1).jpg',
  Simbrah: '../Brahman _ Cattle, Breed, Heat Tolerance, Adaptability, & Facts _ Britannica_files/bull-Brahman-cart-India-New-Delhi.jpg',
  Beefmaster: '../Brahman _ Cattle, Breed, Heat Tolerance, Adaptability, & Facts _ Britannica_files/Brahman-bull-cattle.jpg',
  Charolais: '../Brahman _ Cattle, Breed, Heat Tolerance, Adaptability, & Facts _ Britannica_files/Red-Poll-cow-calf.jpg',
  Bonsmara: '../Brahman _ Cattle, Breed, Heat Tolerance, Adaptability, & Facts _ Britannica_files/Brahman-cow-cattle(2).jpg'
};

function getBreedImage(breed, fallbackQuery) {
  if (!breed) return DEFAULT_ANIMAL_IMAGE(fallbackQuery || 'livestock');
  const normalized = breed.trim();
  return BREED_IMAGE_MAP[normalized] || DEFAULT_ANIMAL_IMAGE(`${normalized} cattle`);
}

const INCIDENT_DATA = [
  {
    id: 'inc1',
    title: 'Missing cattle report',
    location: 'Bloemfontein, Free State',
    status: 'unresolved',
    description: 'Unverified report with last sighting near the airport.',
    lat: -29.127,
    lon: 26.2041
  },
  {
    id: 'inc2',
    title: 'Recovered herd',
    location: 'Pretoria, Gauteng',
    status: 'resolved',
    description: 'Herd recovered and confirmed returned to owner.',
    lat: -25.7479,
    lon: 28.2293
  },
  {
    id: 'inc3',
    title: 'Verified theft alert',
    location: 'East London, Eastern Cape',
    status: 'verified',
    description: 'Verified incident under investigation with community support.',
    lat: -33.0153,
    lon: 27.9116
  }
];

const apiStatusMessage = document.getElementById('apiStatusMessage');
const loadZooAnimalsButton = document.getElementById('loadZooAnimals');
const incidentListElement = document.getElementById('incidentList');
const animalMapContainer = document.getElementById('animalMap');
const incidentMapContainer = document.getElementById('incidentMap');

let animalMap;
let animalMarker;
let incidentMap;

function updateApiStatus(message, type = 'info') {
  if (!apiStatusMessage) return;
  apiStatusMessage.textContent = message;
  apiStatusMessage.className = `api-status-message ${type}`;
}

function renderAnimalList() {
  if (!animalList) return;
  animalList.innerHTML = '';
  Object.entries(animalData).forEach(([animalKey, animal]) => {
    addAnimalToList(animalKey, animal);
  });
}

async function fetchZooAnimals() {
  let lastError = null;

  for (const url of ZOO_API_SOURCES) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        lastError = new Error(`Zoo Animal API failed (${url}): ${response.status}`);
        continue;
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length) {
        return data;
      }
      if (data && typeof data === 'object' && Object.keys(data).length) {
        return [data];
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Zoo Animal API unavailable.');
}

async function fetchWikipediaSummary(name) {
  try {
    const response = await fetch(WIKI_API_URL + encodeURIComponent(name));
    if (!response.ok) return null;
    const data = await response.json();
    return data.extract || data.description || null;
  } catch {
    return null;
  }
}

async function fetchGbifData(name) {
  try {
    const response = await fetch(GBIF_API_URL + encodeURIComponent(name));
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || data.matchType === 'NONE') return null;
    return {
      kingdom: data.kingdom || '',
      phylum: data.phylum || '',
      class: data.class || '',
      order: data.order || '',
      family: data.family || '',
      genus: data.genus || '',
      species: data.species || ''
    };
  } catch {
    return null;
  }
}

async function geocodeLocation(query) {
  if (!query) return null;
  try {
    const response = await fetch(NOMINATIM_URL + encodeURIComponent(query));
    if (!response.ok) return null;
    const results = await response.json();
    return results.length ? results[0] : null;
  } catch {
    return null;
  }
}

function initAnimalMap() {
  if (!animalMapContainer || !window.L) return;
  animalMap = L.map('animalMap', {
    center: [-29.0, 24.0],
    zoom: 5,
    minZoom: 5,
    maxZoom: 10,
    maxBounds: [[-35.0, 16.0], [-22.0, 33.0]],
    zoomControl: true
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(animalMap);
  animalMarker = L.marker([-29.0, 24.0]).addTo(animalMap).bindPopup('South Africa');
}

function initIncidentMap() {
  if (!incidentMapContainer || !window.L) return;
  incidentMap = L.map('incidentMap', {
    center: [-29.0, 24.0],
    zoom: 5,
    minZoom: 5,
    maxZoom: 10,
    maxBounds: [[-35.0, 16.0], [-22.0, 33.0]],
    zoomControl: true
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(incidentMap);
}

function setMapLocation(lat, lon, label) {
  if (!animalMap || !animalMarker || !lat || !lon) return;
  const position = [parseFloat(lat), parseFloat(lon)];
  animalMarker.setLatLng(position).bindPopup(label || 'Animal location').openPopup();
  animalMap.setView(position, 4);
}

function getIncidentMarkerColor(status) {
  if (status === 'resolved' || status === 'solved') return '#2563eb';
  if (status === 'verified') return '#16a34a';
  return '#ef4444';
}

function createIncidentIcon(color) {
  return L.divIcon({
    className: 'incident-pin-icon',
    html: `<span style="background:${color};"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    popupAnchor: [0, -18]
  });
}

let incidentMarkers = [];

function clearIncidentMarkers() {
  incidentMarkers.forEach(marker => {
    if (incidentMap && incidentMap.hasLayer(marker)) {
      incidentMap.removeLayer(marker);
    }
  });
  incidentMarkers = [];
}

function renderIncidentMarkers() {
  if (!incidentMap || !window.L || !Array.isArray(INCIDENT_DATA)) return;
  clearIncidentMarkers();
  const bounds = [];
  INCIDENT_DATA.forEach(incident => {
    const icon = createIncidentIcon(getIncidentMarkerColor(incident.status));
    const marker = L.marker([incident.lat, incident.lon], { icon }).addTo(incidentMap);
    marker.bindPopup(`
      <strong>${incident.title}</strong><br>
      ${incident.location}<br>
      <em>${incident.description}</em><br>
      <strong>Status:</strong> ${incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
    `);
    incidentMarkers.push(marker);
    bounds.push([incident.lat, incident.lon]);
  });
  if (bounds.length) {
    incidentMap.fitBounds(bounds, { padding: [40, 40] });
  }
}

function renderIncidentList() {
  if (!incidentListElement) return;
  incidentListElement.innerHTML = '';
  INCIDENT_DATA.forEach(incident => {
    const item = document.createElement('li');
    const label = incident.status === 'resolved' || incident.status === 'solved'
      ? 'resolved'
      : incident.status === 'verified'
      ? 'verified'
      : 'pending';
    item.innerHTML = `
      <div class="incident-meta">
        <strong>${incident.title}</strong>
        <span>${incident.location}</span>
        <p>${incident.description}</p>
      </div>
      <span class="incident-status ${label}">
        ${incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
      </span>
    `;
    item.addEventListener('click', () => {
      if (!incidentMap) return;
      incidentMap.setView([incident.lat, incident.lon], 7);
    });
    incidentListElement.appendChild(item);
  });
}

function addApiAnimals(animals) {
  animals.forEach((item, index) => {
    const animalKey = normalizeAnimalKey(item.id || item.name || `api-animal-${index}`);
    animalData[animalKey] = {
      name: item.name || item.species || `Animal ${index + 1}`,
      id: item.id || `API-${index + 1}`,
      breed: item.animal_type || item.species || 'Unknown',
      dob: item.dob || 'Unknown',
      targetWeight: item.weight ? `${item.weight} kg` : 'N/A',
      weight: item.weight ? `${item.weight} kg` : 'N/A',
      status: 'unknown',
      healthScore: 'N/A',
      location: item.habitat || item.geo_range || 'Unknown',
      nextCheckup: 'TBD',
      latestActivity: item.diet ? `Diet: ${item.diet}` : 'No activity data',
      note: item.diet ? `Diet: ${item.diet}` : 'No notes available.',
      general: item.lifespan ? `Expected lifespan: ${item.lifespan} years.` : 'No general details available.',
      medical: 'No medical history available.',
      ownership: 'Not available.',
      image: item.image_link || item.image || getBreedImage(item.animal_type || item.breed || item.species || item.name, item.name || 'animal'),
      geo_range: item.geo_range || item.habitat || '',
      wikiSummary: null,
      gbif: null,
      coords: null
    };
  });
}

async function loadAnimalsFromApi() {
  if (!animalList) return;
  try {
    const animals = await fetchZooAnimals();
    if (!Array.isArray(animals) || !animals.length) {
      throw new Error('No animals returned by the Zoo Animal API.');
    }
    addApiAnimals(animals);
    updateApiStatus(`Loaded ${animals.length} animals from free animal APIs.`, 'success');
  } catch (error) {
    updateApiStatus('Free animal APIs failed, using built-in default animals.', 'error');
    console.warn('Zoo Animal API fetch failed:', error);
  }
}

const animalData = {
  bessie: {
    image: getBreedImage('Brahman', 'Brahman cow'),
    name: 'Bessie',
    id: 'SA-442-90',
    breed: 'Brahman',
    dob: '2021-03-12',
    targetWeight: '750 kg',
    weight: '520 kg',
    status: 'healthy',
    healthScore: '94%',
    location: 'North Pasture',
    nextCheckup: '14 days',
    latestActivity: 'Grazing at East fence',
    note: 'Docile temperament. Monitor feed intake with higher grain ratio during the next two weeks.',
    general: 'Tagged on 2021-03-12. Bessie is monitored via GPS collar and scheduled for a vaccination refresh in two weeks.',
    medical: 'Routine vaccination scheduled. No recent incidents. Weight trend is stable and within the expected range for Brahman cattle.',
    ownership: 'Owned on behalf of FarmLife partner cooperative. Provenance verified with regional tracking and electronic ID.'
  },
  duke: {
    image: getBreedImage('Angus', 'Angus cattle'),
    name: 'Duke',
    id: 'SA-612-90',
    breed: 'Angus',
    dob: '2020-11-05',
    targetWeight: '870 kg',
    weight: '690 kg',
    status: 'sick',
    healthScore: '72%',
    location: 'South Barn',
    nextCheckup: '3 days',
    latestActivity: 'Resting near water trough',
    note: 'Requires close observation after recent respiratory symptoms. Keep separate from main herd for 48 hours.',
    general: 'Duke is under close care following a minor respiratory issue. His activity is monitored continuously using collar telemetry.',
    medical: 'Observed mild cough this week. Veterinarian recommended a targeted medication course and hydration checks every 6 hours.',
    ownership: 'Recorded under FarmLife managed livestock. Tag provenance validated by on-farm inspection report.'
  },
  shadow: {
    image: getBreedImage('Hereford', 'Hereford cattle'),
    name: 'Shadow',
    id: 'SA-442-91',
    breed: 'Hereford',
    dob: '2022-01-22',
    targetWeight: '680 kg',
    weight: '560 kg',
    status: 'healthy',
    healthScore: '91%',
    location: 'West Grazing Zone',
    nextCheckup: '21 days',
    latestActivity: 'Moving between paddocks',
    note: 'Highly active and responsive. Ideal candidate for breeding program evaluation.',
    general: 'Shadow shows consistent growth and strong herd behavior. Movement patterns are stable with no alerts.',
    medical: 'No outstanding medical notes. Vaccinations are current and feed intake is consistent with target projections.',
    ownership: 'FarmLife verified asset. Provenance confirmed through electronic ear tag and registration ledger.'
  },
  bella: {
    image: getBreedImage('Dorper', 'Dorper sheep'),
    name: 'Bella',
    id: 'SA-939-32',
    breed: 'Dorper',
    dob: '2021-08-14',
    targetWeight: '620 kg',
    weight: '600 kg',
    status: 'normal',
    healthScore: '86%',
    location: 'East Ridge',
    nextCheckup: '10 days',
    latestActivity: 'Wandering perimeter fence',
    note: 'Stable condition. Recommended to increase trace mineral supplements over the next week.',
    general: 'Bella is a strong performer with consistent patrol patterns. Her grazing cycle is aligned with pasture rotations.',
    medical: 'Healthy but watch for minor lameness due to recent hoof trimming. Follow up in 10 days.',
    ownership: 'Verified asset in the FarmLife livestock registry. Ownership chain is documented and up to date.'
  }
};

const profileName = document.getElementById('profileName');
const profileTag = document.getElementById('profileTag');
const profileStatus = document.getElementById('profileStatus');
const profileImage = document.getElementById('profileImage');
const weightValue = document.getElementById('weightValue');
const healthScore = document.getElementById('healthScore');
const locationValue = document.getElementById('locationValue');
const nextCheckup = document.getElementById('nextCheckup');
const profileDetails = document.getElementById('profileDetails');
const notesArea = document.getElementById('notesArea');
const tabContent = document.getElementById('tabContent');
const animalList = document.getElementById('animalList');
const searchInput = document.getElementById('searchAnimal');
const addAnimalForm = document.getElementById('addAnimalForm');
const formMessage = document.getElementById('animalFormMessage');
const animalStatusInput = document.getElementById('animalStatus');
const animalLocationInput = document.getElementById('animalLocation');
const animalLatestActivityInput = document.getElementById('animalLatestActivity');
const addAnimalPanel = document.getElementById('addAnimalPanel');
const toggleAddAnimalPanelButton = document.getElementById('toggleAddAnimalPanel');
const tabs = document.querySelectorAll('.tab');

function setActiveNavLink() {
  document.querySelectorAll('nav a').forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    }
  });
}

function showFormMessage(text, type) {
  if (!formMessage) return;
  formMessage.textContent = text;
  formMessage.className = 'form-status-message ' + type;
}

function normalizeAnimalKey(value) {
  const base = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  let key = base || `animal-${Date.now()}`;
  let suffix = 1;
  while (animalData[key]) {
    key = `${base || 'animal'}-${suffix}`;
    suffix += 1;
  }
  return key;
}

function generateLatestActivity(location, status) {
  const area = location ? location.trim() : 'assigned area';
  const action = status === 'sick' ? 'Under observation' : status === 'normal' ? 'Moving' : 'Grazing';
  return `${action} in ${area}`;
}

function updateLatestActivityField() {
  if (!animalLatestActivityInput) return;
  const location = animalLocationInput ? animalLocationInput.value.trim() : '';
  const status = animalStatusInput ? animalStatusInput.value : 'healthy';
  animalLatestActivityInput.value = generateLatestActivity(location, status);
}

function addAnimalToList(animalKey, animal) {
  const existing = animalList.querySelector(`li[data-id="${animalKey}"]`);
  if (existing) return existing;
  const li = document.createElement('li');
  li.dataset.id = animalKey;
  li.innerHTML = `
    <span>${animal.name}</span>
    <span class="status ${animal.status}">${animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}</span>
  `;
  li.addEventListener('click', async () => {
    setActiveAnimalItem(li);
    await updateSelectedAnimal(animalKey);
  });
  animalList.appendChild(li);
  return li;
}

function collapseAddAnimalPanel(collapsed) {
  if (!addAnimalPanel || !toggleAddAnimalPanelButton) return;
  addAnimalPanel.classList.toggle('collapsed', collapsed);
  toggleAddAnimalPanelButton.textContent = collapsed ? 'Add another' : 'Hide';
}

function clearAnimalForm() {
  if (!addAnimalForm) return;
  addAnimalForm.reset();
  updateLatestActivityField();
}

function handleAddAnimal(event) {
  event.preventDefault();
  const name = document.getElementById('animalName').value.trim();
  const id = document.getElementById('animalTag').value.trim();
  const breed = document.getElementById('animalBreed').value;
  const dob = document.getElementById('animalDob').value;
  const weight = document.getElementById('animalWeight').value.trim();
  const targetWeight = document.getElementById('animalTargetWeight').value.trim();
  const status = document.getElementById('animalStatus').value;
  const location = document.getElementById('animalLocation').value.trim();
  const nextCheckup = document.getElementById('animalNextCheckup').value.trim();
  const latestActivity = animalLatestActivityInput ? animalLatestActivityInput.value.trim() : 'No activity recorded.';
  const note = document.getElementById('animalNote').value.trim() || 'No additional notes.';
  const general = document.getElementById('animalGeneral').value.trim() || 'No general details available.';
  const medical = document.getElementById('animalMedical').value.trim() || 'No medical history recorded.';
  const ownership = document.getElementById('animalOwnership').value.trim() || 'Ownership details pending.';
  const image = getBreedImage(breed, name);

  if (!name || !id || !breed || !dob || !weight || !targetWeight || !location || !nextCheckup || !latestActivity) {
    showFormMessage('Please complete all required fields before adding the animal.', 'error');
    return;
  }

  const animalKey = normalizeAnimalKey(id || name);
  animalData[animalKey] = {
    name,
    id,
    breed,
    dob,
    targetWeight,
    weight,
    status,
    healthScore: '—',
    location,
    nextCheckup,
    latestActivity,
    note,
    general,
    medical,
    ownership,
    image
  };

  const newItem = addAnimalToList(animalKey, animalData[animalKey]);
  if (newItem) {
    setActiveAnimalItem(newItem);
    updateProfile(animalKey);
    newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showFormMessage('New animal added to the herd list.', 'success');
    clearAnimalForm();
    collapseAddAnimalPanel(true);
  }
}

function renderDetails(animal) {
  profileDetails.innerHTML = `
    <li><strong>Tag ID:</strong> ${animal.id}</li>
    <li><strong>Breed Type:</strong> ${animal.breed}</li>
    <li><strong>Date of Birth:</strong> ${animal.dob}</li>
    <li><strong>Target Weight:</strong> ${animal.targetWeight}</li>
    <li><strong>Latest Activity:</strong> ${animal.latestActivity}</li>
  `;
}

function renderTabContent(animal, tab) {
  const titleMap = {
    general: 'General Information',
    medical: 'Medical History',
    ownership: 'Ownership & Provenance'
  };
  const contentMap = {
    general: animal.general,
    medical: animal.medical,
    ownership: animal.ownership
  };

  const wikiHtml = animal.wikiSummary
    ? `<div class="api-extra"><h3>Wikipedia Summary</h3><p>${animal.wikiSummary}</p></div>`
    : `<div class="api-extra"><h3>Wikipedia Summary</h3><p>Additional species description will appear after selection.</p></div>`;

  const classification = animal.gbif ? `
      <div class="api-extra">
        <h3>GBIF classification</h3>
        <ul class="classification-list">
          <li><strong>Kingdom:</strong> ${animal.gbif.kingdom || 'N/A'}</li>
          <li><strong>Phylum:</strong> ${animal.gbif.phylum || 'N/A'}</li>
          <li><strong>Class:</strong> ${animal.gbif.class || 'N/A'}</li>
          <li><strong>Order:</strong> ${animal.gbif.order || 'N/A'}</li>
          <li><strong>Family:</strong> ${animal.gbif.family || 'N/A'}</li>
          <li><strong>Genus:</strong> ${animal.gbif.genus || 'N/A'}</li>
          <li><strong>Species:</strong> ${animal.gbif.species || 'N/A'}</li>
        </ul>
      </div>`
    : '';

  tabContent.innerHTML = `
    <h2>${titleMap[tab]}</h2>
    <p>${contentMap[tab]}</p>
    <ul>
      <li><strong>Health score:</strong> ${animal.healthScore}</li>
      <li><strong>Current zone:</strong> ${animal.location}</li>
      <li><strong>Next review:</strong> ${animal.nextCheckup}</li>
    </ul>
    ${wikiHtml}
    ${classification}
  `;
}

function updateProfile(animalKey) {
  const animal = animalData[animalKey];
  if (!animal) return;

  profileName.textContent = animal.name;
  profileTag.textContent = `${animal.breed} · Tag ${animal.id} · Next vaccine due in ${animal.nextCheckup}`;
  profileStatus.textContent = animal.status.charAt(0).toUpperCase() + animal.status.slice(1);
  profileStatus.className = `pill ${animal.status}`;
  if (animal.image) {
    profileImage.src = animal.image;
  }
  profileImage.alt = `${animal.name} profile photo`;
  weightValue.textContent = animal.weight;
  healthScore.textContent = animal.healthScore;
  locationValue.textContent = animal.location;
  nextCheckup.textContent = animal.nextCheckup;
  renderDetails(animal);
  notesArea.value = animal.note;
  const activeTab = document.querySelector('.tab.active');
  renderTabContent(animal, activeTab ? activeTab.dataset.tab : 'general');
}

async function updateSelectedAnimal(animalKey) {
  const animal = animalData[animalKey];
  if (!animal) return;
  updateProfile(animalKey);

  if (!animal.wikiSummary) {
    animal.wikiSummary = await fetchWikipediaSummary(animal.name) || 'No summary available.';
  }

  if (!animal.gbif) {
    animal.gbif = await fetchGbifData(animal.name);
  }

  if (!animal.coords) {
    const query = animal.geo_range || animal.location || animal.breed || animal.name;
    const location = await geocodeLocation(query);
    if (location) {
      animal.coords = location;
      setMapLocation(location.lat, location.lon, animal.name);
    }
  } else if (animal.coords) {
    setMapLocation(animal.coords.lat, animal.coords.lon, animal.name);
  }

  updateProfile(animalKey);
}

function setActiveAnimalItem(item) {
  animalList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
  item.classList.add('active');
}

function filterAnimals(query) {
  const normalized = query.trim().toLowerCase();
  animalList.querySelectorAll('li').forEach(li => {
    const text = li.textContent.toLowerCase();
    li.style.display = text.includes(normalized) ? 'flex' : 'none';
  });
}

async function initializeProfile() {
  setActiveNavLink();
  renderAnimalList();
  initAnimalMap();
  initIncidentMap();
  renderIncidentList();
  renderIncidentMarkers();
  updateApiStatus('Click Load free animal data to import profiles from open APIs.', 'info');

  if (loadZooAnimalsButton) {
    loadZooAnimalsButton.addEventListener('click', async () => {
      updateApiStatus('Loading animals from Zoo Animal API...', 'info');
      try {
        await loadAnimalsFromApi();
        renderAnimalList();
        const firstItem = animalList.querySelector('li');
        if (firstItem) {
          setActiveAnimalItem(firstItem);
          await updateSelectedAnimal(firstItem.dataset.id);
        }
      } catch (error) {
        console.warn('Free animal API load failed:', error);
        updateApiStatus(`Animal API unavailable: ${error.message}`, 'error');
      }
    });
  }

  const defaultAnimalKey = animalData.bessie ? 'bessie' : Object.keys(animalData)[0];
  const defaultItem = animalList.querySelector(`li[data-id="${defaultAnimalKey}"]`) || animalList.querySelector('li');
  if (defaultItem) {
    setActiveAnimalItem(defaultItem);
    updateProfile(defaultItem.dataset.id);
  }

  animalList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', async () => {
      setActiveAnimalItem(li);
      await updateSelectedAnimal(li.dataset.id);
    });
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const current = animalList.querySelector('li.active');
      updateProfile(current ? current.dataset.id : 'bessie');
    });
  });

  searchInput.addEventListener('input', event => {
    filterAnimals(event.target.value);
  });

  if (animalStatusInput && animalLocationInput && animalLatestActivityInput) {
    animalStatusInput.addEventListener('change', updateLatestActivityField);
    animalLocationInput.addEventListener('input', updateLatestActivityField);
    updateLatestActivityField();
  }

  if (toggleAddAnimalPanelButton) {
    toggleAddAnimalPanelButton.addEventListener('click', () => {
      collapseAddAnimalPanel(!addAnimalPanel.classList.contains('collapsed'));
    });
  }

  if (addAnimalForm) {
    addAnimalForm.addEventListener('submit', handleAddAnimal);
  }
}

document.addEventListener('DOMContentLoaded', initializeProfile);
