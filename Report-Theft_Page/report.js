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
// This function checks the current page's filename and adds the 'active' class to the corresponding navigation link, allowing for visual indication of the active page in the navigation bar.
document.addEventListener('DOMContentLoaded', function() {
  setActiveNavLink();

  const reportForm = document.getElementById('reportForm');
  if (!reportForm) return;
// This block of code adds an event listener for the DOMContentLoaded event, which ensures that the function to set the active navigation link is called once the HTML document has been fully loaded and parsed. This allows the navigation bar to correctly highlight the current page when the user visits it. It also sets up an event listener for the report form submission, which handles the logic for validating the form inputs and storing the report alert in localStorage before redirecting to the notifications page.
  reportForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const farmerName = document.getElementById('farmerName').value.trim();
    const animalType = document.getElementById('animalType').value.trim();
    const quantity = document.getElementById('quantity').value.trim();
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('description').value.trim();
    const status = document.getElementById('status').value;

    if (!farmerName || !animalType || !quantity || Number(quantity) <= 0 || !location || !description || !status) {
      alert('Please complete all report details before submitting.');
      return;
    }
// This block of code retrieves the values from the form inputs, validates that all required fields are filled and that the quantity is a positive number. If any validation fails, it shows an alert and prevents form submission. If validation passes, it creates a report alert object with the form data and the current timestamp, stores it in localStorage, and redirects the user to the notifications page where they can see their submitted report.
    const reportAlert = {
      farmerName,
      animalType,
      quantity,
      location,
      description,
      status,
      submittedAt: new Date().toISOString()
    };

    localStorage.setItem('pendingReportAlert', JSON.stringify(reportAlert));
    window.location.href = '../notifications.HTML';
  });
});