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

  // Replace these values with the ones from your EmailJS dashboard
  // 1) Public Key (User ID) from EmailJS project settings
  // 2) Service ID for the email service you configure in EmailJS
  // 3) Template ID for the reset password email template
  const EMAILJS_PUBLIC_KEY = 'qYcQbkRyujpgPnIul';
  const EMAILJS_SERVICE_ID = 'service_vq0t4sf';
  const EMAILJS_TEMPLATE_ID = 'template_g3l3pcn';

  const forgotMessage = document.getElementById('forgotMessage');
  const fallbackLink = document.getElementById('fallbackLink');

  const isEmailjsConfigured = window.emailjs &&
    EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
    EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' &&
    EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';

  if (window.emailjs && typeof window.emailjs.init === 'function' && isEmailjsConfigured) {
    window.emailjs.init(EMAILJS_PUBLIC_KEY);
  }

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

  function generateResetToken(length = 48) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  function saveResetToken(email, token, expiresMinutes = 15) {
    const stored = localStorage.getItem('farmLifeResetTokens');
    const tokens = stored ? JSON.parse(stored) : [];
    const expiresAt = Date.now() + expiresMinutes * 60 * 1000;
    const filtered = tokens.filter(entry => entry.email.toLowerCase() !== email.toLowerCase());
    filtered.push({ email: email.toLowerCase(), token, expiresAt });
    localStorage.setItem('farmLifeResetTokens', JSON.stringify(filtered));
  }

  function buildResetLink(email, token) {
    const baseUrl = window.location.href.replace(/[^/]*$/, '');
    const params = new URLSearchParams({ email, token });
    return `${baseUrl}reset-password.html?${params.toString()}`;
  }

  function showForgotMessage(message, type) {
    forgotMessage.textContent = message;
    forgotMessage.className = 'login-message ' + type;
    if (fallbackLink) {
      fallbackLink.textContent = '';
      fallbackLink.style.display = 'none';
    }
  }

  function displayFallbackLink(link) {
    if (!fallbackLink) return;
    fallbackLink.innerHTML = `Reset link: <a href="${link}" target="_blank" rel="noopener">${link}</a>`;
    fallbackLink.style.display = 'block';
  }

  document.getElementById('forgotForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    showForgotMessage('', '');

    if (!email) {
      showForgotMessage('Please enter your email address.', 'error');
      return;
    }

    const user = findUserByEmail(email);
    if (!user) {
      showForgotMessage('No account found with that email. Please sign up first.', 'error');
      return;
    }

    const token = generateResetToken();
    saveResetToken(email, token);

    const resetLink = buildResetLink(email, token);

    if (!isEmailjsConfigured) {
      showForgotMessage('EmailJS is not configured. Use the reset link below or configure EmailJS to send it automatically.', 'warning');
      displayFallbackLink(resetLink);
      return;
    }

    // EmailJS template must include these variables:
    // {{to_email}}, {{user_name}}, {{reset_link}}, {{link_expiry}}, {{app_name}}
    // Example template body in EmailJS:
    // Hello {{user_name}},
    //
    // Click here to reset your FarmLife password:
    // {{reset_link}}
    //
    // This link expires in {{link_expiry}}.
    //
    // If you did not request this, ignore this email.
    //
    // Thanks,
    // {{app_name}}
    const templateParams = {
      to_email: email,
      user_name: user.name || 'FarmLife User',
      reset_link: resetLink,
      link_expiry: '15 minutes',
      app_name: 'FarmLife'
    };

    window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(function() {
        showForgotMessage(`A reset email has been sent to ${email}. Check your inbox.`, 'success');
      }, function(error) {
        console.error('EmailJS error:', error);
        const errorMessage = error && (error.text || error.message || error.statusText || JSON.stringify(error));
        showForgotMessage(`Email send failed: ${errorMessage}. Check console and ensure your template includes reset_link.`, 'error');
        displayFallbackLink(resetLink);
      });
  });
});
