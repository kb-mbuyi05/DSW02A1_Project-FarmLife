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
// this block of code initializes the alert data and defines the icons for each alert type. The `alerts` array contains sample alert objects with properties such as `id`, `type`, `title`, `desc`, `time`, and `read` status. The `icons` object maps each alert type to a corresponding emoji for visual representation in the UI. This setup allows for easy management and display of alerts based on their type and status.
const alerts = [
  { id: 1, type: 'danger', title: 'Unusual Movement Detected', desc: 'Cow #102 moved outside boundary', time: '2 mins ago', read: false },
  { id: 2, type: 'warning', title: 'Disease Outbreak Warning', desc: 'FMD reported nearby farms', time: '45 mins ago', read: false },
  { id: 3, type: 'info', title: 'Vaccination Due', desc: '3 cattle scheduled for vaccination', time: '2 hours ago', read: false }
];

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
      <button class="action-btn"type="button" data-id="${alert.id}">${alert.read ? 'Read' : 'View Details'}</button>
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
  const button = event.target.closest('.action-btn');
  if (!button) return;

  const id = Number(button.dataset.id);
  const alert = alerts.find(item => item.id === id);
  if (!alert) return;

  alert.read = true;
  button.textContent = 'Read';
  renderAlerts(document.querySelector('.tab.active').dataset.type);
});
// this block of code adds an event listener to the alert list container to handle clicks on the action buttons within each alert card. When a button is clicked, it identifies the corresponding alert by its ID, marks it as read, updates the button text to "Read", and re-renders the alerts based on the currently active filter. This allows users to interact with individual alerts and manage their read status effectively.

markAllBtn.addEventListener('click', () => {
  alerts.forEach(alert => { alert.read = true; });
  renderAlerts(document.querySelector('.tab.active').dataset.type);
});

renderAlerts();
