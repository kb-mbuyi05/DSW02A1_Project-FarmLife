// Highlights an active link in the navigation bar
document.querySelectorAll("nav a").forEach(link => {
  if (link.href === window.location.href) link.classList.add("active");
});

// Breeding & Growth Forecast Chart
const ctxGrowth = document.getElementById("growthChart").getContext("2d");
new Chart(ctxGrowth, {
  type: "bar",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      { label: "Actual", data: [400, 420, 450, 460, 470, 482], backgroundColor: "#2c3e50" },
      { label: "Projected", data: [410, 430, 500, 520, 540, 560], backgroundColor: "#f39c12" },
      { label: "Efficiency %", data: [90, 92, 94, 95, 96, 97], type: "line", borderColor: "green", fill: false }
    ]
  }
});

// Regional Security Trend Chart
const ctxSecurity = document.getElementById("securityChart").getContext("2d");
new Chart(ctxSecurity, {
  type: "line",
  data: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      { label: "Incidents", data: [12, 9, 15, 11], borderColor: "#e74c3c", fill: false }
    ]
  }
});