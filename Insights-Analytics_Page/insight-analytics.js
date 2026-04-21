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

function initializeCharts() {
  const growthCtx = document.getElementById('growthChart')?.getContext('2d');
  if (growthCtx) {
    new Chart(growthCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Actual Count',
            data: [400, 420, 450, 460, 470, 482],
            backgroundColor: '#1d4ed8',
            borderRadius: 8,
            order: 2
          },
          {
            label: 'Projected Count',
            data: [410, 430, 500, 520, 540, 560],
            backgroundColor: '#f59e0b',
            borderRadius: 8,
            order: 2
          },
          {
            label: 'Efficiency %',
            data: [90, 92, 94, 95, 96, 97],
            type: 'line',
            borderColor: '#10b981',
            borderWidth: 3,
            fill: false,
            order: 1,
            pointBackgroundColor: '#10b981',
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  const securityCtx = document.getElementById('securityChart')?.getContext('2d');
  if (securityCtx) {
    new Chart(securityCtx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Theft Incidents',
            data: [12, 9, 15, 11],
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            borderWidth: 3,
            fill: true,
            pointBackgroundColor: '#dc2626',
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setActiveNavLink();
  initializeCharts();
});
