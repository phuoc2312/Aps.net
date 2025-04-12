document.addEventListener("DOMContentLoaded", () => {
  // Redirect if already logged in
  if (isLoggedIn()) {
    window.location.href = "/Content/index.html"
    return
  }

  // Add event listener to register form
  const registerForm = document.getElementById("registerForm")
  if (registerForm) {
    registerForm.addEventListener("submit", register)
  }

  // Update cart count
  updateCartCount()
})

// Assuming these are defined elsewhere, but declaring them here to resolve the errors.
// In a real application, these would likely be imported or defined in a shared scope.
function isLoggedIn() {
  // Replace with actual logic to check if the user is logged in
  return false
}

function updateCartCount() {
  // Replace with actual logic to update the cart count
  console.log("Cart count updated.")
}

const API_BASE_URL = "https://your-api-base-url.com" // Replace with your actual API base URL

// Register function
async function register(event) {
  event.preventDefault()

  const username = document.getElementById("username").value
  const email = document.getElementById("email").value
  const fullName = document.getElementById("fullName").value
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirmPassword").value

  const registerAlert = document.getElementById("registerAlert")

  // Validate passwords match
  if (password !== confirmPassword) {
    if (registerAlert) {
      registerAlert.textContent = "Passwords do not match."
      registerAlert.style.display = "block"
      return
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        fullName,
        password,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Registration failed")
    }

    // Show success message
    alert("Registration successful! Please login with your new account.")

    // Redirect to login page
    window.location.href = "/Content/login.html"
  } catch (error) {
    console.error("Registration error:", error)

    if (registerAlert) {
      registerAlert.textContent = error.message || "Registration failed. Please try again."
      registerAlert.style.display = "block"
    }
  }
}
