// stockthefr_forum.js
// Handles receiving notifications and displaying them in the forum

document.addEventListener('DOMContentLoaded', function() {
  const stored = localStorage.getItem('reportNotification') || localStorage.getItem('forumNotification');
  if (!stored) return;

  let notif;
  try {
    notif = JSON.parse(stored);
  } catch (error) {
    console.error('Unable to parse forum notification:', error);
    return;
  }

  if (!notif || !notif.farmerName || !notif.animalType) return;

  let statusLabel = 'Pending review by forum members';
  if (notif.status !== 'approved') {
    notif.status = 'approved';
    notif.seenByForum = true;
    notif.statusNote = 'Approved and being attended';
    notif.statusUpdatedAt = new Date().toISOString();
    statusLabel = 'Approved and being attended';
    localStorage.setItem('reportNotification', JSON.stringify(notif));
    localStorage.setItem('forumNotification', JSON.stringify(notif));
    localStorage.setItem('pendingReportAlert', JSON.stringify(notif));
  } else if (notif.status === 'approved') {
    notif.seenByForum = true;
    statusLabel = 'Approved and being attended';
  }

  const notifDiv = document.getElementById('forumNotification');
  if (notifDiv) {
    notifDiv.innerHTML = `<div class="forum-alert">
      <h2>Stock Theft Forum Alert</h2>
      <p><strong>Farmer:</strong> ${notif.farmerName}</p>
      <p><strong>Animal:</strong> ${notif.animalType} (${notif.quantity})</p>
      <p><strong>Location:</strong> ${notif.location}</p>
      <p><strong>Description:</strong> ${notif.description}</p>
      <p><strong>Status:</strong> ${statusLabel}</p>
      <button onclick="window.location.href='../AnimalProfiles_Page/animal-profiles.html'">Track Animal Location</button>
    </div>`;
  }

  if (notif.seenByForum) {
    const contactDiv = document.getElementById('forumContact');
    if (contactDiv) {
      contactDiv.innerHTML = `
        <div class="forum-contact-card">
          <ul>
            <li><strong>Phone:</strong> +27 71 123 4567</li>
            <li><strong>WhatsApp:</strong> +27 71 123 4567</li>
            <li><strong>Email:</strong> thief.official@farmlife.co.za</li>
          </ul>
        </div>
      `;
    }
  }
});
