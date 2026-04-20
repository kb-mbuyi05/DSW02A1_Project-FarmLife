// Handles the forgot password form submission
document.getElementById("forgotForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  //Basic validation to check if email is entered
  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  //Simulated reset link
  alert(`A password reset link has been sent to ${email}.`);

  //Redirects back to login page after sending
  window.location.href = "login.html";
})