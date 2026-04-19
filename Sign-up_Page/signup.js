//Checks the value of the password that the user has entered
document.getElementById("signupForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const password = document.getElementById("password").value.trim();
  const confirmedPassword= document.getElementById("confirmPassword").value.trim();

  //Validates that the password and the password confirmation match. If they do not match, an alert is shown to the user and the form submission is prevented.
  if (password !== confirmedPassword) {
    alert("Passwords do not match. Please try again.");
    return;
  }

  alert("Account created successfully!");

  //Redirects the user to the login page after the user has successfully created an account.
  window.location.href = "login.html";
})