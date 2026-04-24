// this script is responsible for handling the homepage's interactive features, such as setting the active navigation link and adding hover effects to buttons.
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