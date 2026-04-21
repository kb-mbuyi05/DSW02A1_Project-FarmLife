function validateName(name) {
  if (name.length < 2) {
    alert('Full name must be at least 2 characters long.');
    return false;
  }
  // This regular expression allows only letters (both uppercase and lowercase) and spaces in the full name. It ensures that the name does not contain any numbers, special characters, or punctuation marks, which helps maintain a clean and professional format for user names.
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    alert('Full name can only contain letters and spaces.');
    return false;
  }
  return true;
}
// This function validates the full name input by checking that it is at least 2 characters long and contains only letters and spaces. If the validation fails, it shows an alert with the appropriate message and returns false to prevent form submission. If the validation passes, it returns true, allowing the form submission process to continue.
function validateEmail(email) {
  if (email === '') {
    alert('Email address is required.');
    return false;
  }
  // This regular expression checks that the email address is in a valid format and specifically ends with "@gmail.com". It ensures that the email contains a local part (before the @ symbol) that can include letters, numbers, dots, underscores, percent signs, plus signs, and hyphens, followed by the domain "gmail.com". This validation helps ensure that users provide a valid Gmail address for their account.
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    alert('Email must be a valid Gmail address (e.g., example@gmail.com).');
    return false;
  }
  return true;
}
// This function validates the email input by checking that it is not empty and that it matches the specified regular expression for a valid Gmail address. If the validation fails, it shows an alert with the appropriate message and returns false to prevent form submission. If the validation passes, it returns true, allowing the form submission process to continue.
function validatePassword(password) {
  if (password === '') {
    alert('Password is required.');
    return false;
  }
  // This regular expression checks that the password is at least 8 characters long and includes at least one uppercase letter, one lowercase letter, one number, and one special character.
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    alert('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
    return false;
  }
  return true;
}
// This function validates the password input by checking that it is not empty and that it matches the specified regular expression for a strong password. If the validation fails, it shows an alert with the appropriate message and returns false to prevent form submission. If the validation passes, it returns true, allowing the form submission process to continue.
function validateConfirmPassword(password, confirmedPassword) {
  if (confirmedPassword === '') {
    alert('Confirm password is required.');
    return false;
  }
  if (password !== confirmedPassword) {
    alert('Passwords do not match. Please try again.');
    return false;
  }
  return true;
}
// This function validates the confirmed password input by checking that it is not empty and that it matches the password input. If the validation fails, it shows an alert with the appropriate message and returns false to prevent form submission. If the validation passes, it returns true, allowing the form submission process to continue.
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
  document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
// This block of code adds an event listener to the sign-up form submission. When the form is submitted, it prevents the default behavior, retrieves the input values for name, email, password, and confirmed password, and then calls the respective validation functions for each input. If any validation fails, it will show an alert and prevent form submission. If all validations pass, it redirects the user to the login page.
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmedPassword = document.getElementById('confirmPassword').value.trim();

    if (!validateName(name)) return;
    if (!validateEmail(email)) return;
    if (!validatePassword(password)) return;
    if (!validateConfirmPassword(password, confirmedPassword)) return;

    window.location.href = '../Log-in_Page/login.html';
  });
});