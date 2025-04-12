const API_BASE_URL = "https://your-api-base-url.com" // Replace with your actual API base URL
const CART_KEY = "cart"

document.addEventListener("DOMContentLoaded", () => {
  // Load categories for dropdown
  loadCategories()

  // Load products
  loadProducts()

  // Update cart count
  updateCartCount()

  // Add search functionality
  const searchButton = document.getElementById("searchButton")
  if (searchButton) {
    searchButton.addEventListener("click", searchProducts)
  }

  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchProducts()
      }
    })
  }
})

// Load categories
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/Categories`)
    const categories = await response.json()

    const categoriesList = document.getElementById("categoriesList")
    if (categoriesList) {
      categoriesList.innerHTML = ""

      categories.forEach((category) => {
        const li = document.createElement("li")
        li.innerHTML = `<a class="dropdown-item" href="/Content/category.html?id=${category.id}">${category.name}</a>`
        categoriesList.appendChild(li)
      })
    }
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

// Load products
async function loadProducts() {
  const productsList = document.getElementById("productsList")
  if (!productsList) return

  try {
    const response = await fetch(`${API_BASE_URL}/Products`)
    const products = await response.json()

    productsList.innerHTML = ""

    if (products.length === 0) {
      productsList.innerHTML = '<div class="col-12 text-center"><p>No products found.</p></div>'
      return
    }

    products.forEach((product) => {
      const productCard = document.createElement("div")
      productCard.className = "col-md-4 mb-4"
      productCard.innerHTML = `
                <div class="card product-card">
                    <img src="${product.imageUrl || "/Content/images/placeholder.jpg"}" class="card-img-top product-image" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-truncate">${product.description || ""}</p>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <div class="d-flex justify-content-between">
                            <a href="/Content/product-detail.html?id=${product.id}" class="btn btn-outline-primary">View Details</a>
                            <button class="btn btn-primary add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.imageUrl || "/Content/images/placeholder.jpg"}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `
      productsList.appendChild(productCard)
    })

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", addToCart)
    })
  } catch (error) {
    console.error("Error loading products:", error)
    productsList.innerHTML =
      '<div class="col-12 text-center"><p>Error loading products. Please try again later.</p></div>'
  }
}

// Search products
function searchProducts() {
  const searchInput = document.getElementById("searchInput")
  if (!searchInput) return

  const searchTerm = searchInput.value.trim()
  if (searchTerm === "") {
    loadProducts()
    return
  }

  const productsList = document.getElementById("productsList")
  if (!productsList) return

  productsList.innerHTML = `
        <div class="text-center w-100">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `

  fetch(`${API_BASE_URL}/Products`)
    .then((response) => response.json())
    .then((products) => {
      const filteredProducts = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )

      productsList.innerHTML = ""

      if (filteredProducts.length === 0) {
        productsList.innerHTML = `<div class="col-12 text-center"><p>No products found matching "${searchTerm}".</p></div>`
        return
      }

      filteredProducts.forEach((product) => {
        const productCard = document.createElement("div")
        productCard.className = "col-md-4 mb-4"
        productCard.innerHTML = `
                    <div class="card product-card">
                        <img src="${product.imageUrl || "/Content/images/placeholder.jpg"}" class="card-img-top product-image" alt="${product.name}">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text text-truncate">${product.description || ""}</p>
                            <p class="product-price">$${product.price.toFixed(2)}</p>
                            <div class="d-flex justify-content-between">
                                <a href="/Content/product-detail.html?id=${product.id}" class="btn btn-outline-primary">View Details</a>
                                <button class="btn btn-primary add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.imageUrl || "/Content/images/placeholder.jpg"}">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                `
        productsList.appendChild(productCard)
      })

      // Add event listeners to "Add to Cart" buttons
      document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", addToCart)
      })
    })
    .catch((error) => {
      console.error("Error searching products:", error)
      productsList.innerHTML =
        '<div class="col-12 text-center"><p>Error searching products. Please try again later.</p></div>'
    })
}

// Add to cart
function addToCart(event) {
  const button = event.currentTarget
  const id = button.getAttribute("data-id")
  const name = button.getAttribute("data-name")
  const price = Number.parseFloat(button.getAttribute("data-price"))
  const image = button.getAttribute("data-image")

  const cart = JSON.parse(localStorage.getItem(CART_KEY)) || []

  const existingItem = cart.find((item) => item.id === id)
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      id,
      name,
      price,
      image,
      quantity: 1,
    })
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  updateCartCount()

  // Show success message
  alert(`${name} has been added to your cart.`)
}

// Update cart count
function updateCartCount() {
  const cartCountElements = document.querySelectorAll("#cartCount")
  if (cartCountElements.length === 0) return

  const cart = JSON.parse(localStorage.getItem(CART_KEY)) || []
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  cartCountElements.forEach((element) => {
    element.textContent = totalItems
  })
}
