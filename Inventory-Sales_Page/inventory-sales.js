// Highlights active link in the navigation bar
document.querySelectorAll("nav a").forEach(link => {
  if (link.href === window.location.href) link.classList.add("active");
});

// Herd Growth & Sales Trends Chart
const ctxGrowthSales = document.getElementById("growthSalesChart").getContext("2d");
new Chart(ctxGrowthSales, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      { label: "Total Herd", data: [450, 455, 460, 462, 465, 468], borderColor: "#2c3e50", fill: false },
      { label: "Units Sold", data: [20, 25, 30, 28, 32, 35], borderColor: "#f39c12", fill: false }
    ]
  }
});

// Monthly Revenue Flux Chart
const ctxRevenue = document.getElementById("revenueChart").getContext("2d");
new Chart(ctxRevenue, {
  type: "bar",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      { label: "Revenue (R)", data: [65000, 70000, 75000, 72000, 68000, 72000], backgroundColor: "#27ae60" }
    ]
  }
});

// Quick Sale Entry Form
document.getElementById("saleForm").addEventListener