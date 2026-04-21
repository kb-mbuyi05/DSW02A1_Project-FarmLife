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

function setupButtonHover() {
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mouseover', () => {
      btn.style.opacity = '0.9';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.opacity = '1';
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setActiveNavLink();
  setupButtonHover();
});