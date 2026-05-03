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
  emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');

  const forgotMessage = document.getElementById('forgotMessage');

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

  function findUserByEmail(email) {
    const users = getStoredUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  function updateUserPassword(email, newPassword) {
    const users = getStoredUsers();
    const index = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    if (index === -1) return false;
    users[index].password = newPassword;
    localStorage.setItem('farmLifeUsers', JSON.stringify(users));
    return true;
  }

  function showForgotMessage(message, type) {
    forgotMessage.textContent = message;
    forgotMessage.className = 'login-message ' + type;
  }

  document.getElementById('forgotForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    showForgotMessage('', '');

    if (!email) {
      showForgotMessage('Please enter your email address.', 'error');
      return;
    }

    const newPassword = Array.from({ length: 10 }, () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      return chars.charAt(Math.floor(Math.random() * chars.length));
    }).join('');

    const user = findUserByEmail(email);
    if (!user) {
      showForgotMessage('No account found with that email. Please sign up first.', 'error');
      return;
    }
      `A password reset email has been sent to ${destination}.\n\n` +
      `Your temporary password is: ${newPassword}\n\n` +
      'You will be redirected to the login page to sign in with the new password.'
    ;

    setTimeout(() => {
      window.location.href = '../Log-in_Page/login.html';
    }, 500);
  });
});