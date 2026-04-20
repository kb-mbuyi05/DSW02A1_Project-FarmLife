document.getElementById("offlinePage").classList.remove("hidden");

const offlinePage = document.getElementById('offlinePage');
const retryBtn = document.getElementById('retryBtn');

// Function to check online status
function updateOnlineStatus() {
  if (navigator.onLine) {
    offlinePage.classList.add('hidden');
  } else {
    offlinePage.classList.remove('hidden');
  }
}

// Retry button shows alert instead of reload
retryBtn.addEventListener('click', () => {
  if (!navigator.onLine) {
    alert("You are offline");
  } else {
    alert("You are back online!");
  }
});

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial check
updateOnlineStatus();

