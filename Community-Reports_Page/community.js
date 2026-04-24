// Highlights an active link in the navigation bar
document.querySelectorAll("nav a").forEach(link => {
  if (link.href === window.location.href) link.classList.add("active");
});

// Report Theft button
const reportButton = document.querySelector(".report-btn");
if (reportButton) {
  reportButton.addEventListener("click", () => {
    window.location.href = "../Report-Theft_Page/report.html";
  });
}