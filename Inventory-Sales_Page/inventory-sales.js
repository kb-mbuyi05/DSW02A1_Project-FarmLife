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

function initializeCharts() {
  const growthSalesCtx = document.getElementById('growthSalesChart')?.getContext('2d');
  if (growthSalesCtx) {
    new Chart(growthSalesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            // This dataset represents the total herd size over the first six months of the year. It is styled with a blue line and a light blue fill to visually differentiate it from the sales data.
            label: 'Total Herd',
            data: [450, 455, 460, 462, 465, 468],
            borderColor: '#1d4ed8',
            backgroundColor: 'rgba(29, 78, 216, 0.08)',
            borderWidth: 3,
            fill: true,
            pointBackgroundColor: '#1d4ed8',
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4
          },
          {
            label: 'Units Sold',
            data: [20, 25, 30, 28, 32, 35],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderWidth: 3,
            fill: true,
            pointBackgroundColor: '#f59e0b',
            pointRadius: 5,
            pointHoverRadius: 7,
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
// This block initializes a line chart using Chart.js to display the growth of the herd and units sold over the first six months of the year. It includes styling for the lines, points, and area under the curves for better visualization.
  const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue (R)',
            data: [65000, 70000, 75000, 72000, 68000, 72000],
            backgroundColor: '#10b981',
            borderRadius: 8
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
// This block initializes a bar chart using Chart.js to display the revenue generated from sales over the first six months of the year. It includes styling for the bars and ensures the chart is responsive and maintains its aspect ratio.
function setupSaleForm() {
  const saleForm = document.getElementById('saleForm');
  if (!saleForm) return;
  // This function sets up an event listener for the sale form submission. When the form is submitted, it prevents the default behavior, retrieves the input values, and if all fields are filled, it displays an alert with the sale details and resets the form for the next entry. This allows users to easily record sales transactions in the inventory system.

  saleForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const tagId = document.getElementById('tagId').value;
    const salePrice = document.getElementById('salePrice').value;
    const saleDate = document.getElementById('saleDate').value;
    const buyerName = document.getElementById('buyerName').value;

    if (tagId && salePrice && saleDate && buyerName) {
      alert(`Sale recorded: ${tagId} sold to ${buyerName} for R ${salePrice} on ${saleDate}`);
      saleForm.reset();
    }
  });
}
// This function sets up an event listener for the sale form submission. When the form is submitted, it prevents the default behavior, retrieves the input values, and if all fields are filled, it displays an alert with the sale details and resets the form for the next entry. This allows users to easily record sales transactions in the inventory system.
document.addEventListener('DOMContentLoaded', function() {
  setActiveNavLink();
  initializeCharts();
  setupSaleForm();
});
