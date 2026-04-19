const alertsList = document.getElementById('alertsList');
const tabs = document.querySelectorAll('.tab');
const counter = document.getElementById('counter');
const unreadBadge = document.getElementById('unreadBadge');
const markAllBtn = document.getElementById('markAll');

const icons = {
  danger: '🚨',
  warning: '⚠️',
  info: 'ℹ️'
};

const alerts = [
  { id: 1, type: 'danger', title: 'Unusual Movement Detected', desc: 'Cow #102 moved outside boundary', time: '2 mins ago', read: false },
  { id: 2, type: 'warning', title: 'Disease Outbreak Warning', desc: 'FMD reported nearby farms', time: '45 mins ago', read: false },
  { id: 3, type: 'info', title: 'Vaccination Due', desc: '3 cattle scheduled for vaccination', time: '2 hours ago', read: false }
];

function countUnread() {
  return alerts.filter(alert => !alert.read).length;
}

function updateStatus(filter, visibleCount) {
  const unreadCount = countUnread();
  counter.textContent = `Showing ${visibleCount} alert${visibleCount === 1 ? '' : 's'}`;
  unreadBadge.textContent = `${unreadCount} unread`;
  markAllBtn.disabled = unreadCount === 0;
}

function renderAlerts(filter = 'all') {
  alertsList.innerHTML = '';
  const filtered = alerts.filter(alert => filter === 'all' || alert.type === filter);

  if (!filtered.length) {
    alertsList.innerHTML = `
      <div class="empty-state">
        <strong>No alerts found.</strong>
        <p>Try selecting a different category or check back later for updates.</p>
      </div>
    `;
    updateStatus(filter, 0);
    return;
  }

  filtered.forEach(alert => {
    const card = document.createElement('article');
    card.className = `alert ${alert.type} ${alert.read ? 'read' : 'unread'}`;
    card.innerHTML = `
      <div class="alert-header">
        <div class="alert-title">${icons[alert.type]} ${alert.title}</div>
        <span class="time">${alert.time}</span>
      </div>
      <p>${alert.desc}</p>
      <button class="action-btn" type="button" data-id="${alert.id}">${alert.read ? 'Read' : 'View Details'}</button>
    `;
    alertsList.appendChild(card);
  });

  updateStatus(filter, filtered.length);
}

function setActiveTab(selectedTab) {
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab === selectedTab);
    tab.setAttribute('aria-selected', tab === selectedTab ? 'true' : 'false');
  });
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    setActiveTab(tab);
    renderAlerts(tab.dataset.type);
  });
});

alertsList.addEventListener('click', event => {
  const button = event.target.closest('.action-btn');
  if (!button) return;

  const id = Number(button.dataset.id);
  const alert = alerts.find(item => item.id === id);
  if (!alert) return;

  alert.read = true;
  button.textContent = 'Read';
  renderAlerts(document.querySelector('.tab.active').dataset.type);
});

markAllBtn.addEventListener('click', () => {
  alerts.forEach(alert => { alert.read = true; });
  renderAlerts(document.querySelector('.tab.active').dataset.type);
});

renderAlerts();
