
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
  const loginMessage = document.getElementById('loginMessage');

  function showMessage(text, type) {
    loginMessage.textContent = text;
    loginMessage.className = 'login-message ' + type;
  }

  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const roleInput = document.querySelector('input[name="role"]:checked');

    if (!roleInput) {
      showMessage('Please select a role before logging in.', 'error');
      return;
    }

    if (!email || !password) {
      showMessage('Please fill in all fields.', 'error');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long.', 'error');
      return;
    }

    const role = roleInput.value;
    let redirectUrl;
    let successMessage;

    if (role === 'farmer') {
      redirectUrl = '../Homepage/homepage.html';
      successMessage = 'Login successful! Redirecting to the home page.';
    } else if (role === 'admin') {
      redirectUrl = '../Dashboard_Page/dashboard.html';
      successMessage = 'Login successful! Redirecting to the dashboard.';
    } else if (role === 'community') {
      redirectUrl = '../Report-Theft_Page/stockthefr_forum.html';
      successMessage = 'Login successful! Redirecting to the community forum.';
    } else {
      redirectUrl = '../Homepage/homepage.html';
      successMessage = 'Login successful! Redirecting to the home page.';
    }

    localStorage.setItem('farmLifeUserRole', role);
    showMessage(successMessage, 'success');
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 800);
  });
// This block of code adds an event listener to the login form submission. When the form is submitted, it prevents the default behavior, retrieves the selected role, email and password values, validates them, and redirects the user to the dashboard or community forum page.
  document.getElementById('showPassword').addEventListener('change', function() {
    const passwordField = document.getElementById('password');
    const type = this.checked ? 'text' : 'password';
    passwordField.type = type;
  });
});