document.addEventListener("DOMContentLoaded", () => {
  // Declare variables (assuming they are defined elsewhere or should be global)
  const API_BASE_URL = "YOUR_API_BASE_URL" // Replace with your actual API base URL
  const isLoggedIn = () => {
    return localStorage.getItem("token") !== null
  } // Example implementation
  const updateCartCount = () => {
    console.log("Update cart count function called")
  } // Example implementation
  const setAuthData = (token, userData) => {
    localStorage.setItem("token", token)
    localStorage.setItem("userData", JSON.stringify(userData))
  } // Example implementation

  // Redirect if already logged in
  if (isLoggedIn()) {
    window.location.href = "/Content/index.html"
    return
  }

  // Add event listener to login form
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", login)
  }

  // Update cart count
  updateCartCount()
})

// Login function
async function login(event) {
  event.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  const loginAlert = document.getElementById("loginAlert")

  try {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error("Invalid username or password")
    }

    const data = await response.json()

    // Save auth data
    setAuthData(data.token, {
      id: data.userId,
      username: data.username,
    })

    // Redirect to home page
    window.location.href = "/Content/index.html"
  } catch (error) {
    console.error("Login error:", error)

    if (loginAlert) {
      loginAlert.textContent = "Invalid username or password. Please try again."
      loginAlert.style.display = "block"
    }
  }
}
