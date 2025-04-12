document.addEventListener("DOMContentLoaded", () => {
  // Load categories for dropdown
  loadCategories()

  // Load cart items
  loadCartItems()

  // Update cart count
  updateCartCount()

  // Add event listener to checkout form
  const checkoutForm = document.getElementById("checkoutForm")
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", placeOrder)
  }
})

// Dummy declarations for variables that are assumed to be defined elsewhere
const CART_KEY = "cart"
const API_BASE_URL = "https://api.example.com" // Replace with your actual API base URL

// Dummy functions for isLoggedIn, getCurrentUser, getToken, loadCategories, and updateCartCount
function isLoggedIn() {
  // Replace with your actual authentication logic
  return false
}

function getCurrentUser() {
  // Replace with your actual user retrieval logic
  return {
    id: 1,
    fullName: "Guest User",
    email: "guest@example.com",
    address: "Guest Address",
    phone: "123-456-7890",
  }
}

function getToken() {
  // Replace with your actual token retrieval logic
  return ""
}

function loadCategories() {
  // Replace with your actual category loading logic
  console.log("Loading categories...")
}

function updateCartCount() {
  // Replace with your actual cart count update logic
  console.log("Updating cart count...")
}

// Load cart items
function loadCartItems() {
  const cartItems = document.getElementById("cartItems")
  if (!cartItems) return

  const cart = JSON.parse(localStorage.getItem(CART_KEY)) || []

  if (cart.length === 0) {
    cartItems.innerHTML = `
            <div class="cart-empty">
                <h4>Your cart is empty</h4>
                <p>Looks like you haven't added any products to your cart yet.</p>
                <a href="/Content/index.html" class="btn btn-primary mt-3">Continue Shopping</a>
            </div>
        `

    // Hide checkout section
    const checkoutSection = document.getElementById("checkoutSection")
    if (checkoutSection) {
      checkoutSection.style.display = "none"
    }

    return
  }

  let totalAmount = 0
  let cartHtml = ""

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity
    totalAmount += itemTotal

    cartHtml += `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${item.image}" alt="${item.name}" class="img-fluid cart-item-image">
                    </div>
                    <div class="col-md-4">
                        <h5>${item.name}</h5>
                        <p class="text-muted">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="col-md-2">
                        <div class="input-group">
                            <button class="btn btn-outline-secondary decrease-quantity" data-id="${item.id}">-</button>
                            <input type="text" class="form-control text-center item-quantity" value="${item.quantity}" readonly>
                            <button class="btn btn-outline-secondary increase-quantity" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="col-md-2 text-end">
                        <p class="fw-bold">$${itemTotal.toFixed(2)}</p>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-danger btn-sm remove-item" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            </div>
        `
  })

  cartHtml += `
        <div class="d-flex justify-content-between align-items-center mt-4">
            <a href="/Content/index.html" class="btn btn-outline-primary">Continue Shopping</a>
            <div class="text-end">
                <h4>Total: $${totalAmount.toFixed(2)}</h4>
                <button id="proceedToCheckoutBtn" class="btn btn-success mt-2">Proceed to Checkout</button>
            </div>
        </div>
    `

  cartItems.innerHTML = cartHtml

  // Add event listeners
  document.querySelectorAll(".decrease-quantity").forEach((button) => {
    button.addEventListener("click", () => updateItemQuantity(button.getAttribute("data-id"), -1))
  })

  document.querySelectorAll(".increase-quantity").forEach((button) => {
    button.addEventListener("click", () => updateItemQuantity(button.getAttribute("data-id"), 1))
  })

  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", () => removeCartItem(button.getAttribute("data-id")))
  })

  const proceedToCheckoutBtn = document.getElementById("proceedToCheckoutBtn")
  if (proceedToCheckoutBtn) {
    proceedToCheckoutBtn.addEventListener("click", showCheckoutSection)
  }

  // Update order summary
  updateOrderSummary(totalAmount)
}

// Update item quantity
function updateItemQuantity(itemId, change) {
  const cart = JSON.parse(localStorage.getItem(CART_KEY)) || []

  const itemIndex = cart.findIndex((item) => item.id === itemId)
  if (itemIndex === -1) return

  cart[itemIndex].quantity += change

  if (cart[itemIndex].quantity < 1) {
    cart[itemIndex].quantity = 1
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  loadCartItems()
  updateCartCount()
}

// Remove cart item
function removeCartItem(itemId) {
  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || []

  cart = cart.filter((item) => item.id !== itemId)

  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  loadCartItems()
  updateCartCount()
}

// Show checkout section
function showCheckoutSection() {
  const checkoutSection = document.getElementById("checkoutSection")
  if (checkoutSection) {
    checkoutSection.style.display = "flex"

    // Scroll to checkout section
    checkoutSection.scrollIntoView({ behavior: "smooth" })

    // Pre-fill form if user is logged in
    if (isLoggedIn()) {
      const user = getCurrentUser()

      document.getElementById("fullName").value = user.fullName || ""
      document.getElementById("email").value = user.email || ""
      document.getElementById("address").value = user.address || ""
      document.getElementById("phone").value = user.phone || ""
    }
  }
}

// Update order summary
function updateOrderSummary(totalAmount) {
  const orderSummary = document.getElementById("orderSummary")
  if (!orderSummary) return

  const cart = JSON.parse(localStorage.getItem(CART_KEY)) || []

  let summaryHtml = ""

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity

    summaryHtml += `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.name} x ${item.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `
  })

  summaryHtml += `
        <hr>
        <div class="d-flex justify-content-between">
            <h5>Total</h5>
            <h5>$${totalAmount.toFixed(2)}</h5>
        </div>
    `

  orderSummary.innerHTML = summaryHtml
}

// Place order
async function placeOrder(event) {
  event.preventDefault()

  const cart = JSON.parse(localStorage.getItem(CART_KEY)) || []
  if (cart.length === 0) return

  const fullName = document.getElementById("fullName").value
  const email = document.getElementById("email").value
  const address = document.getElementById("address").value
  const phone = document.getElementById("phone").value

  // Create order details
  const orderDetails = cart.map((item) => ({
    productId: Number.parseInt(item.id),
    quantity: item.quantity,
  }))

  // Create order object
  const order = {
    userId: isLoggedIn() ? getCurrentUser().id : 1, // Use guest user ID if not logged in
    orderDate: new Date().toISOString(),
    status: "Pending",
    shippingAddress: address,
    orderDetails: orderDetails,
  }

  try {
    // Send order to API
    const response = await fetch(`${API_BASE_URL}/Orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(isLoggedIn() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(order),
    })

    if (!response.ok) {
      throw new Error("Failed to place order")
    }

    // Clear cart
    localStorage.removeItem(CART_KEY)

    // Show success message
    alert("Your order has been placed successfully!")

    // Redirect to home page
    window.location.href = "/Content/index.html"
  } catch (error) {
    console.error("Error placing order:", error)
    alert("Failed to place order. Please try again later.")
  }
}
