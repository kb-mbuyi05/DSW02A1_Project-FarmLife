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

document.addEventListener('DOMContentLoaded', function() {
  setActiveNavLink();

  const resetIntro = document.getElementById('resetIntro');
  const resetForm = document.getElementById('resetForm');
  const resetMessage = document.getElementById('resetMessage');

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

  function getStoredResetTokens() {
    const stored = localStorage.getItem('farmLifeResetTokens');
    if (!stored) return [];
    try {
      return JSON.parse(stored) || [];
    } catch (error) {
      console.warn('Could not parse stored reset tokens:', error);
      return [];
    }
  }

  function findTokenEntry(email, token) {
    const tokens = getStoredResetTokens();
    return tokens.find(entry => entry.email === email.toLowerCase() && entry.token === token);
  }

  function clearToken(email, token) {
    const tokens = getStoredResetTokens();
    const updated = tokens.filter(entry => !(entry.email === email.toLowerCase() && entry.token === token));
    localStorage.setItem('farmLifeResetTokens', JSON.stringify(updated));
  }

  function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  function showResetMessage(message, type) {
    resetMessage.textContent = message;
    resetMessage.className = 'login-message ' + type;
  }

  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');
  const token = params.get('token');

  if (!email || !token) {
    resetIntro.textContent = 'This reset link is invalid or missing. Please request a new reset link from the Forgot Password page.';
    return;
  }

  const tokenEntry = findTokenEntry(email, token);
  if (!tokenEntry || Date.now() > tokenEntry.expiresAt) {
    resetIntro.textContent = 'This reset link has expired or is invalid. Please request a new reset link.';
    return;
  }

  resetIntro.textContent = `Reset password for ${email}`;
  resetForm.classList.remove('hidden');

  resetForm.addEventListener('submit', function(e) {
    e.preventDefault();
    showResetMessage('', '');

    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!newPassword || !confirmPassword) {
      showResetMessage('Please enter and confirm your new password.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showResetMessage('Passwords do not match. Please try again.', 'error');
      return;
    }

    if (!validatePassword(newPassword)) {
      showResetMessage('Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.', 'error');
      return;
    }

    const users = getStoredUsers();
    const userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      showResetMessage('No account was found for this email.', 'error');
      return;
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('farmLifeUsers', JSON.stringify(users));
    clearToken(email, token);

    showResetMessage('Your password has been updated. Redirecting to login...', 'success');
    setTimeout(() => {
      window.location.href = '../Log-in_Page/login.html';
    }, 2500);
  });
});
