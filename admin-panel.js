document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();  // Prevent the form from submitting

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch('https://luxflight-travel-fb03a9ec5505.herokuapp.com/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.message === 'Login successful') {
          // Assuming the response contains user data, you can save it in localStorage
          localStorage.setItem("loggedInUser", JSON.stringify(data.user));  // Save entire user object

          // Redirect to the admin panel
          window.location.href = "admin-panel-main.html";
      } else {
          alert("Incorrect username or password. Please try again.");
      }
  })
  .catch(error => {
      console.error('Error during login:', error);
      alert("There was an error processing your login. Please try again.");
  });
});

