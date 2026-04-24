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

  document.getElementById('forgotForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const destination = email || 'khakakatangana@gmail.com';

    if (!email) {
      alert('Please enter your email address.');
      return;
    }

    const newPassword = Array.from({ length: 10 }, () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      return chars.charAt(Math.floor(Math.random() * chars.length));
    }).join('');

    alert(
      `A password reset email has been sent to ${destination}.\n\n` +
      `Your temporary password is: ${newPassword}\n\n` +
      'You will be redirected to the login page to sign in with the new password.'
    );

    setTimeout(() => {
      window.location.href = '../Log-in_Page/login.html';
    }, 500);
  });
});