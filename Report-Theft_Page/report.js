document.getElementById("reportForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const farmerName = document.getElementById("farmerName").value;
  const animalType = document.getElementById("animalType").value;
  const quantity = document.getElementById("quantity").value;
  const location = document.getElementById("location").value;
  const description = document.getElementById("description").value;
  const status = document.getElementById("status").value;

  alert(`Report submitted!\nFarmer: ${farmerName}\nAnimals: ${quantity} ${animalType}\nLocation: ${location}\nStatus: ${status}`);

  // Redirect back to Community Reports page
  window.location.href = "community.html";
});