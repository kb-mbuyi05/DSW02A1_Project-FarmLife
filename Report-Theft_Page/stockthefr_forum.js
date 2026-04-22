// stockthefr_forum.js
// Handles receiving notifications and displaying them in the forum

document.addEventListener('DOMContentLoaded', function() {
  // Display notification if present in localStorage
  const forumNotification = localStorage.getItem('forumNotification');
  if (forumNotification) {
    const notif = JSON.parse(forumNotification);
    const notifDiv = document.getElementById('forumNotification');
    if (notifDiv) {
      notifDiv.innerHTML = `<div class="forum-alert">
        <h2>New Theft Reported!</h2>
        <p><strong>Farmer:</strong> ${notif.farmerName}</p>
        <p><strong>Animal:</strong> ${notif.animalType} (${notif.quantity})</p>
        <p><strong>Location:</strong> ${notif.location}</p>
        <p><strong>Description:</strong> ${notif.description}</p>
        <button onclick="window.location.href='../AnimalProfiles_Page/animal-profiles.html'">Track Animal Location</button>
      </div>`;
    }
    // Optionally clear notification after displaying
    // localStorage.removeItem('forumNotification');
  }
});
