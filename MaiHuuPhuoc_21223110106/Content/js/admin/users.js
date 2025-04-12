document.addEventListener("DOMContentLoaded", () => {
  // Check if user is admin
  if (!requireAdmin()) {
    return
  }

  // Load users
  loadUsers()

  // Add event listeners
  document.getElementById("saveUserBtn").addEventListener("click", saveUser)
  document.getElementById("updateUserBtn").addEventListener("click", updateUser)
})

// Load users
async function loadUsers() {
  const usersList = document.getElementById("usersList")
  if (!usersList) return

  try {
    const response = await fetch(`${API_BASE_URL}/Users`, addAuthHeader())
    const users = await response.json()

    if (users.length === 0) {
      usersList.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>'
      return
    }

    usersList.innerHTML = ""

    users.forEach((user) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.fullName || ""}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-user" data-id="${user.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">Delete</button>
                </td>
            `
      usersList.appendChild(row)
    })

    // Add event listeners to buttons
    document.querySelectorAll(".edit-user").forEach((button) => {
      button.addEventListener("click", () => editUser(button.getAttribute("data-id")))
    })

    document.querySelectorAll(".delete-user").forEach((button) => {
      button.addEventListener("click", () => deleteUser(button.getAttribute("data-id")))
    })
  } catch (error) {
    console.error("Error loading users:", error)
    usersList.innerHTML = '<tr><td colspan="5" class="text-center">Error loading users</td></tr>'
  }
}

// Save user
async function saveUser() {
  const username = document.getElementById("username").value
  const email = document.getElementById("email").value
  const fullName = document.getElementById("fullName").value
  const password = document.getElementById("password").value
  const address = document.getElementById("address").value
  const phone = document.getElementById("phone").value

  if (!username || !email || !password) {
    alert("Please fill in all required fields")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...addAuthHeader().headers,
      },
      body: JSON.stringify({
        username,
        email,
        fullName,
        password,
        address,
        phone,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to save user")
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("addUserModal"))
    modal.hide()

    // Reset form
    document.getElementById("addUserForm").reset()

    // Reload users
    loadUsers()

    // Show success message
    alert("User saved successfully")
  } catch (error) {
    console.error("Error saving user:", error)
    alert("Failed to save user")
  }
}

// Edit user
async function editUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/Users/${userId}`, addAuthHeader())
    const user = await response.json()

    // Fill form
    document.getElementById("editUserId").value = user.id
    document.getElementById("editUsername").value = user.username
    document.getElementById("editEmail").value = user.email
    document.getElementById("editFullName").value = user.fullName || ""
    document.getElementById("editAddress").value = user.address || ""
    document.getElementById("editPhone").value = user.phone || ""

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("editUserModal"))
    modal.show()
  } catch (error) {
    console.error("Error loading user:", error)
    alert("Failed to load user")
  }
}

// Update user
async function updateUser() {
  const id = document.getElementById("editUserId").value
  const username = document.getElementById("editUsername").value
  const email = document.getElementById("editEmail").value
  const fullName = document.getElementById("editFullName").value
  const address = document.getElementById("editAddress").value
  const phone = document.getElementById("editPhone").value

  if (!username || !email) {
    alert("Please fill in all required fields")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...addAuthHeader().headers,
      },
      body: JSON.stringify({
        id,
        username,
        email,
        fullName,
        address,
        phone,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update user")
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("editUserModal"))
    modal.hide()

    // Reload users
    loadUsers()

    // Show success message
    alert("User updated successfully")
  } catch (error) {
    console.error("Error updating user:", error)
    alert("Failed to update user")
  }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
            method: 'DELETE',
            ...addAuthHeader()
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete user');
        }
        
        // Reload users
        loadUsers();
