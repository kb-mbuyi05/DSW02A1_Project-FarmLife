// Highlights an active link in the navigation bar
document.querySelectorAll("nav a").forEach(link => {
  if (link.href === window.location.href) link.classList.add("active");
});

// Report Theft button
document.querySelector(".report-btn").addEventListener("click", () => {
  alert("Redirecting to theft report form...");
  // Later: window.location.href = "report.html";
});