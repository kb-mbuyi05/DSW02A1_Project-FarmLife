//Highlights the active link in the navigation bar
document.querySelectorAll("nav a").forEach(link => {
  if (link === window.location.href) link.classList.add("active-link");
});

//Adds a hover effect to all buttons on the page
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("mouseover", () => {
    btn.style.opacity = "0.9";
  });
});
btn.addEventListener("mouseout", () => {
    btn.style.opacity = "1";
});