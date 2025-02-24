if (!localStorage.getItem("loggedInUser")) {
  // If not logged in, redirect to the login page
  window.location.href = "admin-panel.html"; // Assuming admin-panel.html is your login page
}

const loggedInUser = localStorage.getItem("loggedInUser");
if (loggedInUser) {
  // Parse the stored JSON object
  const user = JSON.parse(loggedInUser);

  // Extract the name from the parsed user object
  const capitalizedName =
    user.name.charAt(0).toUpperCase() + user.name.slice(1);

  // Display the name in the element
  document.getElementById("loggedInUser").textContent =
    "Logged in as: " + capitalizedName;
}

document
  .getElementById("logoutButton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("loggedInUser");
    window.location.href = "admin-panel.html";
  });
document.addEventListener('DOMContentLoaded', function () {
      
// Retrieve the logged-in user information
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

// Check if the user has the required permissions
const openModalButton = document.getElementById("openModalButton");
if (loggedInUser && (loggedInUser.role === "admin" || loggedInUser.role === "moderator")) {
  openModalButton.style.display = "inline-block"; // Show the button if the user is admin or moderator
} else {
  openModalButton.style.display = "none"; // Hide the button for other users
}

// Modal functionality
const modal = document.getElementById("addUserModal");
const span = document.getElementsByClassName("close")[0];

// Open the modal when the button is clicked
if (loggedInUser && (loggedInUser.role === "admin" || loggedInUser.role === "moderator")) {
  openModalButton.onclick = function () {
    modal.style.display = "block";
  };
}

// Close the modal when the 'x' is clicked
span.onclick = function () {
  modal.style.display = "none";
};

// Close the modal if clicked outside the modal content
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
  // Fetch user data when the page loads
  fetchUsersData();

  async function fetchUsersData() {
    try {
      const response = await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/getUsers'); // Fetch data from backend
      if (!response.ok) {
        throw new Error('Failed to retrieve user data');
      }

      const users = await response.json(); // Expecting an array of users
      console.log(users); // Log user data to check the response format

      updateUserTable(users); // Update the table with the fetched user data
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch user data');
    }
  }

  const tableBody = document.querySelector('#usersTableBody');
  if (!tableBody) {
    console.error('Element with id "usersTableBody" not found');
    return;
  }

  fetchUsersData();

  async function fetchUsersData() {
    try {
      const response = await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/getUsers');
      if (!response.ok) {
        throw new Error('Failed to retrieve user data');
      }

      const users = await response.json();
      updateUserTable(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch user data');
    }
  }

  function updateUserTable(users) {
    tableBody.innerHTML = '';

    // Parse the logged-in user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // Sort users by role and then alphabetically by name
    users.sort((a, b) => {
        const roleOrder = { admin: 1, moderator: 2, user: 3 }; // Define role priority
        const roleA = roleOrder[a.role] || 4; // Default to 4 for undefined roles
        const roleB = roleOrder[b.role] || 4;

        if (roleA !== roleB) {
            return roleA - roleB; // Sort by role priority
        }
        return a.name.localeCompare(b.name); // Sort alphabetically by name within the same role
    });

    // Update user counts
    document.querySelector('.users-active').textContent = users.length;
    document.querySelector('.users1-active').textContent = users.length;

    // Render sorted users
    users.forEach((user) => {
        const maskedPassword = user.password
            ? user.password.charAt(0) + '*'.repeat(user.password.length - 1)
            : '';

        const roleBadge =
            user.role === 'admin'
                ? '<span class="role-badge admin-badge">Owner</span>'
                : user.role === 'moderator'
                ? '<span class="role-badge moderator-badge">Admin</span>'
                : '';

        const deleteButton = 
            loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'moderator')
                ? `<button class="delete-btn" data-username="${user.username}">
                    <i class="fas fa-trash-can"></i>
                  </button>`
                : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name} ${roleBadge}</td>
            <td>${user.email}</td>
            <td>${user.username}</td>
            <td>${maskedPassword}</td>
            <td>${deleteButton}</td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to delete buttons only if the logged-in user has permissions
    if (loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'moderator')) {
        document.querySelectorAll('.delete-btn').forEach((button) => {
            button.addEventListener('click', function () {
                const username = this.getAttribute('data-username');
                deleteUser(username);
            });
        });
    }
}
  
  async function deleteUser(username) {
    // Ask for confirmation before proceeding with the delete action
    const confirmation = confirm(`Are you sure you want to delete the user "${username}"? This action cannot be undone.`);
    
    if (!confirmation) {
      // If the user cancels the action, stop the function from proceeding
      return;
    }
  
    try {
      const response = await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/deleteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
  
      const result = await response.json();
      console.log('User deleted successfully:', result);
      alert(result.message);
      fetchUsersData(); // Reload users data after successful deletion
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    }
  }
  
  
  // Add user form submission
  document.getElementById('addUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const role = document.getElementById('role').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value; // Get the selected role
  

    console.log(role);
    try {
      const response = await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, username, password, name, email }), // Include the role
      });
  
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchUsersData(); // Refresh the user table
        modal.style.display = "none"; // Close the modal
        document.getElementById('addUserForm').reset(); // Reset the form
      } else {
        const error = await response.json();
        alert('Error adding user: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding user');
    }
  });  

  // Refresh button to reload user data
  document.getElementById('refreshUsersButton').addEventListener('click', fetchUsersData);
});
document.addEventListener("DOMContentLoaded", () => {
  const togglePassword = document.getElementById("togglePassword");
  const password = document.getElementById("password");

  togglePassword.addEventListener("click", () => {
    // Toggle the type attribute of the password field
    const type = password.type === "password" ? "text" : "password";
    password.type = type;
    
    // Toggle the icon between regular eye and crossed eye
    const icon = togglePassword.querySelector("i");
    if (password.type === "password") {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    } else {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  });
});
function searchUsers() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const table = document.getElementById('customersTable');  // Assuming the table ID is the same
  const rows = table.getElementsByTagName('tr');

  // Loop through all table rows (except the first one, which is the header)
  for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.getElementsByTagName('td');
      
      let found = false;

      // Check if the input matches any cell in the current row
      for (let j = 0; j < cells.length; j++) {
          if (cells[j]) {
              const cellValue = cells[j].textContent || cells[j].innerText;
              if (cellValue.toLowerCase().indexOf(input) > -1) {
                  found = true;
                  break;
              }
          }
      }

      // Show or hide the row based on whether a match was found
      row.style.display = found ? '' : 'none';
  }
}
function openSidebar() {
  document.getElementById("sidebar").classList.add("sidebar-responsive");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("sidebar-responsive");
}