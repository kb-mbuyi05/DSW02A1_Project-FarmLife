// Highlights an active link
document.querySelectorAll("nav a").forEach(link => {
  if (link.href === window.location.href) link.classList.add("active");
});

// To switch between tabs in the profile section
const tabs = document.querySelectorAll(".tab");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    alert(`Switched to: ${tab.textContent}`);
  });
});

// To highlight the selected animal in the sidebar
const sidebarItems = document.querySelectorAll(".sidebar ul li");
sidebarItems.forEach(item => {
  item.addEventListener("click", () => {
    sidebarItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});