// Define constants for token and user keys
const TOKEN_KEY = "token"
const USER_KEY = "user"

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem(TOKEN_KEY) !== null
}

// Get current user
function getCurrentUser() {
  const userJson = localStorage.getItem(USER_KEY)
  return userJson ? JSON.parse(userJson) : null
}

// Get auth token
function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// Set auth data
function setAuthData(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Clear auth data
function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Logout
function logout() {
  clearAuthData()
  window.location.href = "/Content/login.html"
}

// Check if user is admin
function isAdmin() {
  const user = getCurrentUser()
  return user && user.username === "admin"
}

// Redirect if not logged in
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "/Content/login.html"
    return false
  }
  return true
}

// Redirect if not admin
function requireAdmin() {
  if (!isLoggedIn() || !isAdmin()) {
    window.location.href = "/Content/login.html"
    return false
  }
  return true
}

// Update UI based on auth status
function updateAuthUI() {
  const userSection = document.getElementById("userSection")
  if (!userSection) return

  if (isLoggedIn()) {
    const user = getCurrentUser()
    userSection.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    ${user.username}
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="/Content/profile.html">Profile</a></li>
                    <li><a class="dropdown-item" href="/Content/orders-history.html">Orders</a></li>
                    ${isAdmin() ? '<li><a class="dropdown-item" href="/Content/admin/index.html">Admin Dashboard</a></li>' : ""}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logoutLink">Logout</a></li>
                </ul>
            </div>
        `

    // Add logout event listener
    document.getElementById("logoutLink").addEventListener("click", (e) => {
      e.preventDefault()
      logout()
    })
  } else {
    userSection.innerHTML = `
            <a href="/Content/login.html" class="btn btn-outline-light me-2">Login</a>
            <a href="/Content/register.html" class="btn btn-light">Register</a>
        `
  }
}

// Add auth header to fetch options
function addAuthHeader(options = {}) {
  const token = getToken()
  if (!token) return options

  options.headers = options.headers || {}
  options.headers["Authorization"] = `Bearer ${token}`
  return options
}

// Initialize auth
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI()

  // Add logout event listener to logout button if exists
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout)
  }
})
async function checkAuth() {
    return true; // Luôn cho phép truy cập
}

async function fetchData(url, options = {}) {
    const response = await fetch(`http://localhost:5021${url}`, { ...options, headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
    }
    return response.json();
}