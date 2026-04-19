// Simulate GPS tracking by updating the marker text every 5 seconds
setInterval(() => {
  document.querySelector(".marker").textContent = "Bessie 04 (Battery " + Math.floor(Math.random() * 100) + "%)";
}, 5000);