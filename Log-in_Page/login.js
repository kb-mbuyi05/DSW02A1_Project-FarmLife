
// login.js to handle login form submission and navigation link highlighting
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
// This block of code adds an event listener for the DOMContentLoaded event, which ensures that the function to set the active navigation link is called once the HTML document has been fully loaded and parsed. This allows the navigation bar to correctly highlight the current page when the user visits it.
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    alert('Login successful! Welcome to FarmLife.');
    window.location.href = '../Homepage/homepage.html';
  });
// This block of code adds an event listener to the login form submission. When the form is submitted, it prevents the default behavior, retrieves the email and password values, checks if they are filled, and if so, displays a success message and redirects the user to the homepage. This simulates a login process for demonstration purposes.
  document.getElementById('showPassword').addEventListener('change', function() {
    const passwordField = document.getElementById('password');
    const type = this.checked ? 'text' : 'password';
    passwordField.type = type;
  });
});