const alertsList = document.getElementById('alertsList');
const tabs = document.querySelectorAll('.tab');
const counter = document.getElementById('counter');
const unreadBadge = document.getElementById('unreadBadge');
const markAllBtn = document.getElementById('markAll');
// this block of code selects various DOM elements that will be used to display the alerts, manage the tabs for filtering, and show the status of unread alerts. The `alertsList` is the container where alert cards will be rendered, `tabs` are the filter buttons for different alert types, `counter` displays the number of visible alerts, `unreadBadge` shows the count of unread alerts, and `markAllBtn` is a button to mark all alerts as read. These elements are essential for building an interactive and user-friendly alert management interface.
const icons = {
  danger: '🚨',
  warning: '⚠️',
  info: 'ℹ️'
};

const defaultAlerts = [
  { id: 1, type: 'danger', title: 'Unusual Movement Detected', desc: 'Cow #102 moved outside boundary', time: '2 mins ago', read: false },
  { id: 2, type: 'warning', title: 'Disease Outbreak Warning', desc: 'FMD reported nearby farms', time: '45 mins ago', read: false },
  { id: 3, type: 'info', title: 'Vaccination Due', desc: '3 cattle scheduled for vaccination', time: '2 hours ago', read: false }
];

let alerts = [...defaultAlerts];

function getStoredReportNotification() {
  const stored = localStorage.getItem('reportNotification') || localStorage.getItem('pendingReportAlert');
  if (!stored) return null;

  try {
    const report = JSON.parse(stored);
    return report && typeof report === 'object' ? report : null;
  } catch (error) {
    console.error('Unable to parse stored report notification:', error);
    return null;
  }
}

function syncReportNotification(report) {
  if (!report || typeof report !== 'object') return;
  localStorage.setItem('reportNotification', JSON.stringify(report));
  localStorage.setItem('pendingReportAlert', JSON.stringify(report));
  localStorage.setItem('forumNotification', JSON.stringify(report));
}

function addPendingReportAlert() {
  const report = getStoredReportNotification();
  if (!report || !report.farmerName || !report.animalType || !report.location) return;
  const existing = alerts.find(alert => alert.source === 'report' && alert.id === report.id);
  const reportId = report.id || (Math.max(...alerts.map(alert => alert.id), 0) + 1);
  report.id = reportId;

  const title = `Theft report from ${report.farmerName}`;
  const desc = `${report.quantity} ${report.animalType} reported stolen at ${report.location}. Status: ${report.status}. ${report.description}`;

  if (existing) {
    existing.title = title;
    existing.desc = desc;
    existing.time = 'Just now';
    existing.seenByForum = !!report.seenByForum;
    syncReportNotification(report);
    return;
  }

  alerts.unshift({
    id: reportId,
    type: 'danger',
    title,
    desc,
    time: 'Just now',
    read: false,
    source: 'report',
    seenByForum: !!report.seenByForum
  });

  syncReportNotification(report);
}


function countUnread() {
  return alerts.filter(alert => !alert.read).length;
}
// this function updates the status display at the top of the alert list, showing how many alerts are currently visible based on the selected filter and how many of those are unread. It also enables or disables the "Mark All as Read" button depending on whether there are any unread alerts left. This provides users with a clear overview of their alert status and encourages them to manage their notifications effectively.

function updateStatus(filter, visibleCount) {
  const unreadCount = countUnread();
  counter.textContent = `Showing ${visibleCount} alert${visibleCount === 1 ? '' : 's'}`;
  unreadBadge.textContent = `${unreadCount} unread`;
  markAllBtn.disabled = unreadCount === 0;
}
// this block of code defines the main functionality of the alert system. It initializes the alerts, sets up event listeners for tab clicks and button actions, and defines functions to render alerts based on the selected filter, update the status display, and count unread alerts. The `renderAlerts` function dynamically creates alert cards based on the current filter and updates the status accordingly. The `setActiveTab` function manages the active state of the tabs for better user experience.
function renderAlerts(filter = 'all') {
  alertsList.innerHTML = '';
  const filtered = alerts.filter(alert => filter === 'all' || alert.type === filter);
// this block of code defines the `renderAlerts` function, which is responsible for displaying the alerts based on the selected filter. It first clears the existing alerts from the display, then filters the alerts according to the selected type (or shows all if 'all' is selected). If no alerts match the filter, it displays an empty state message. Otherwise, it creates and appends alert cards to the DOM for each matching alert, and updates the status display with the count of visible and unread alerts.
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
// this block of code checks if there are any alerts to display after filtering. If there are no alerts that match the selected filter, it renders an empty state message to inform the user that no alerts were found. It also updates the status display to reflect that there are zero visible alerts. This provides a better user experience by giving feedback when there are no results to show.
  filtered.forEach(alert => {
    const card = document.createElement('article');
    card.className = `alert ${alert.type} ${alert.read ? 'read' : 'unread'}`;
    card.innerHTML = `
      <div class="alert-header">
        <div class="alert-title">${icons[alert.type]} ${alert.title}</div>
        <span class="time">${alert.time}</span>
      </div>
      <p>${alert.desc}</p>
      <div class="alert-actions">
        <button class="action-btn" type="button" data-id="${alert.id}">${alert.read ? 'Viewed' : 'View Details'}</button>
        <button class="delete-btn" type="button" data-id="${alert.id}">Delete</button>
        ${alert.seenByForum ? '<span class="seen-note">Seen by forum</span>' : ''}
      </div>
    `;
    alertsList.appendChild(card);
  });

  updateStatus(filter, filtered.length);
}
// this function sets the active tab by adding the 'active' class to the selected tab and removing it from the others. It also updates the `aria-selected` attribute for accessibility purposes.

function setActiveTab(selectedTab) {
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab === selectedTab);
    tab.setAttribute('aria-selected', tab === selectedTab ? 'true' : 'false');
  });
}
// this block of code adds click event listeners to each tab. When a tab is clicked, it sets that tab as active and calls the `renderAlerts` function with the corresponding filter type. This allows users to easily switch between different categories of alerts (e.g., all, danger, warning, info) and see the relevant alerts based on their selection.

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    setActiveTab(tab);
    renderAlerts(tab.dataset.type);
  });
});
// this block of code adds click event listeners to each tab. When a tab is clicked, it sets that tab as active and calls the `renderAlerts` function with the corresponding filter type. This allows users to easily switch between different categories of alerts (e.g., all, danger, warning, info) and see the relevant alerts based on their selection.

alertsList.addEventListener('click', event => {
  const actionButton = event.target.closest('.action-btn');
  const deleteButton = event.target.closest('.delete-btn');

  if (deleteButton) {
    const id = Number(deleteButton.dataset.id);
    const alertIndex = alerts.findIndex(item => item.id === id);
    if (alertIndex === -1) return;

    const shouldDelete = window.confirm('Do you want to delete this notification?');
    if (!shouldDelete) return;

    alerts.splice(alertIndex, 1);
    renderAlerts(document.querySelector('.tab.active').dataset.type);
    return;
  }

  if (!actionButton) return;

  const id = Number(actionButton.dataset.id);
  const selectedAlert = alerts.find(item => item.id === id);
  if (!selectedAlert) return;

  const modal = document.getElementById('detailsModal');
  const detailsBody = document.getElementById('detailsBody');
  if (!modal || !detailsBody) return;

  detailsBody.innerHTML = `
    <p><strong>Title:</strong> ${selectedAlert.title}</p>
    <p><strong>Type:</strong> ${selectedAlert.type}</p>
    <p><strong>Time:</strong> ${selectedAlert.time}</p>
    <p>${selectedAlert.desc}</p>
  `;

  selectedAlert.read = true;
  renderAlerts(document.querySelector('.tab.active').dataset.type);

  const isReport = selectedAlert.source === 'report';
  const statusDisplay = isReport ? `<p><strong>Report Status:</strong> ${selectedAlert.status || 'Pending'}</p>` : '';
  const seenMessage = isReport && selectedAlert.seenByForum
    ? '<p><strong>Forum Review:</strong> This report has been reviewed by the forum and is being attended.</p>'
    : '';
  const contactInfo = isReport ? `
    <div class="contact-info">
      <h3>Forum Contact</h3>
      <p>For direct follow-up, please contact the Stock Theft Forum using the information below.</p>
      <ul>
        <li><strong>Phone / WhatsApp:</strong> +27 71 123 4567</li>
        <li><strong>Email:</strong> thief.official@farmlife.co.za</li>
      </ul>
    </div>
  ` : '';

  detailsBody.innerHTML = `
    <p><strong>Title:</strong> ${selectedAlert.title}</p>
    <p>${selectedAlert.desc}</p>
    ${statusDisplay}
    ${seenMessage}
    ${contactInfo}
    <p><strong>Received:</strong> ${selectedAlert.time}</p>
    <p>FarmLife is monitoring this incident and will keep you informed with any updates.</p>
  `;

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
});
// this block of code adds an event listener to the alert list container to handle clicks on both action and delete buttons within each alert card. When the delete button is clicked, it asks for confirmation and removes the alert if confirmed. When the action button is clicked, it marks the alert as read and updates the display.

markAllBtn.addEventListener('click', () => {
  alerts.forEach(alert => { alert.read = true; });
  renderAlerts(document.querySelector('.tab.active').dataset.type);
});

const closeModal = document.getElementById('closeModal');
if (closeModal) {
  closeModal.addEventListener('click', () => {
    const modal = document.getElementById('detailsModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  });
}

addPendingReportAlert();
renderAlerts();
