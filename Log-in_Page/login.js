//Checks to see if the email and password entered are valid
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

//Validates that the email and password fields are not empty
  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

//Alerts the user that the login was successful and redirects them to the home page
  alert("Login successful! Welcome to FarmLife.");

  window.location.href = "home.html";
});