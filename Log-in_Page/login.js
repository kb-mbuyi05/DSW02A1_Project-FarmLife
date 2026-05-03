
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
  const emailField = document.getElementById('email');
  const passwordField = document.getElementById('password');

  function getStoredUsers() {
    const stored = localStorage.getItem('farmLifeUsers');
    if (!stored) return [];
    try {
      return JSON.parse(stored) || [];
    } catch (error) {
      console.warn('Could not parse stored users:', error);
      return [];
    }
  }

  function findUserByRoleAndEmail(role, email) {
    const users = getStoredUsers();
    return users.find(user => user.role === role && user.email.toLowerCase() === email.toLowerCase());
  }

  function showMessage(text, type) {
    loginMessage.textContent = text;
    loginMessage.className = 'login-message ' + type;
  }

  function clearFieldErrors() {
    [emailField, passwordField].forEach(field => field.classList.remove('invalid'));
  }

  function setFieldError(field) {
    clearFieldErrors();
    field.classList.add('invalid');
  }

  function validatePassword(password, role) {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      return 'Password must contain both uppercase and lowercase letters.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must include at least one number.';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};:\"\\|,.<>/?]/.test(password)) {
      return 'Password must include at least one symbol like !@#$%^&*.';
    }
    if (role === 'admin' && password.length < 10) {
      return 'Admin password must be at least 10 characters long.';
    }
    return null;
  }

  function validateEmail(email) {
    if (!email.includes('@')) {
      return 'Email must contain @ symbol.';
    }
    if (!email.toLowerCase().endsWith('gmail.com')) {
      return 'Email must end with gmail.com.';
    }
    const emailPattern = /^[^\s@]+@gmail\.com$/i;
    if (!emailPattern.test(email)) {
      return 'Please enter a valid gmail.com email address.';
    }
    return null;
  }

  function validateCredentials(email, password, role) {
    const user = findUserByRoleAndEmail(role, email);
    if (!user) {
      return { field: 'email', message: 'No registered account found for this email and role. Please sign up.' };
    }
    if (user.password !== password) {
      return { field: 'password', message: 'Password does not match your account.' };
    }
    return null;
  }

  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = emailField.value.trim();
    const password = passwordField.value.trim();
    const roleInput = document.querySelector('input[name="role"]:checked');

    if (!roleInput) {
      showMessage('Please select a role before logging in.', 'error');
      return;
    }

    if (!email || !password) {
      showMessage('Please fill in all fields.', 'error');
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setFieldError(emailField);
      showMessage(emailError, 'error');
      return;
    }

    const role = roleInput.value;
    const passwordError = validatePassword(password, role);
    if (passwordError) {
      setFieldError(passwordField);
      showMessage(passwordError, 'error');
      return;
    }

    const credentialError = validateCredentials(email, password, role);
    if (credentialError) {
      if (credentialError.field === 'email') {
        setFieldError(emailField);
      } else if (credentialError.field === 'password') {
        setFieldError(passwordField);
      }
      showMessage(credentialError.message, 'error');
      return;
    }

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