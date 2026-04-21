const animalData = {
  bessie: {
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
const tabs = document.querySelectorAll('.tab');

function setActiveNavLink() {
  document.querySelectorAll('nav a').forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    }
  });
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
  tabContent.innerHTML = `
    <h2>${titleMap[tab]}</h2>
    <p>${contentMap[tab]}</p>
    <ul>
      <li><strong>Health score:</strong> ${animal.healthScore}</li>
      <li><strong>Current zone:</strong> ${animal.location}</li>
      <li><strong>Next review:</strong> ${animal.nextCheckup}</li>
    </ul>
  `;
}

function updateProfile(animalKey) {
  const animal = animalData[animalKey];
  if (!animal) return;

  profileName.textContent = animal.name;
  profileTag.textContent = `${animal.breed} · Tag ${animal.id} · Next vaccine due in ${animal.nextCheckup}`;
  profileStatus.textContent = animal.status.charAt(0).toUpperCase() + animal.status.slice(1);
  profileStatus.className = `pill ${animal.status}`;
  profileImage.src = `images/${animalKey}.jpg`;
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

function initializeProfile() {
  setActiveNavLink();
  const defaultAnimal = 'bessie';
  updateProfile(defaultAnimal);

  animalList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      setActiveAnimalItem(li);
      updateProfile(li.dataset.id);
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
}

document.addEventListener('DOMContentLoaded', initializeProfile);
