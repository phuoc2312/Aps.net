// Declare global variables
const API_BASE_URL = "https://your-api-base-url.com" // Replace with your actual API base URL
const CART_KEY = "cart"

document.addEventListener("DOMContentLoaded", () => {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search)
  const productId = urlParams.get("id")

  if (!productId) {
    window.location.href = "/Content/index.html"
    return
  }

  // Load product details
  loadProductDetails(productId)

  // Load categories for dropdown
  loadCategories()

  // Update cart count
  updateCartCount()
})

// Load product details
async function loadProductDetails(productId) {
  const productDetail = document.getElementById("productDetail")
  if (!productDetail) return

  try {
    const response = await fetch(`${API_BASE_URL}/Products/${productId}`)
    if (!response.ok) {
      throw new Error("Product not found")
    }

    const product = await response.json()

    // Update breadcrumb
    document.getElementById("productName").textContent = product.name
    const categoryLink = document.getElementById("categoryLink")
    if (categoryLink && product.category) {
      categoryLink.textContent = product.category.name
      categoryLink.href = `/Content/category.html?id=${product.category.id}`
    }

    // Update page title
    document.title = `${product.name} - E-Commerce Store`

    // Display product details
    productDetail.innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <img src="${product.imageUrl || "/Content/images/placeholder.jpg"}" class="img-fluid product-detail-image" alt="${product.name}">
                </div>
                <div class="col-md-6">
                    <h2>${product.name}</h2>
                    <p class="text-muted">Category: ${product.category ? product.category.name : "Uncategorized"}</p>
                    <h3 class="product-price mb-4">$${product.price.toFixed(2)}</h3>
                    <p>${product.description || "No description available."}</p>
                    
                    <div class="d-flex mt-4">
                        <input type="number" id="quantity" class="form-control me-2" value="1" min="1" style="max-width: 100px;">
                        <button id="addToCartBtn" class="btn btn-primary">Add to Cart</button>
                    </div>
                </div>
            </div>
        `

    // Add event listener to "Add to Cart" button
    document.getElementById("addToCartBtn").addEventListener("click", () => {
      const quantity = Number.parseInt(document.getElementById("quantity").value) || 1
      addToCartWithQuantity(product, quantity)
    })

    // Load related products
    loadRelatedProducts(product.categoryId, product.id)
  } catch (error) {
    console.error("Error loading product details:", error)
    productDetail.innerHTML = '<div class="alert alert-danger">Product not found or an error occurred.</div>'
  }
}

// Load related products
async function loadRelatedProducts(categoryId, currentProductId) {
  const relatedProducts = document.getElementById("relatedProducts")
  if (!relatedProducts) return

  try {
    const response = await fetch(`${API_BASE_URL}/Products/Category/${categoryId}`)
    const products = await response.json()

    // Filter out current product and limit to 3 related products
    const filteredProducts = products.filter((product) => product.id !== currentProductId).slice(0, 3)

    if (filteredProducts.length === 0) {
      relatedProducts.innerHTML = "<p>No related products found.</p>"
      return
    }

    relatedProducts.innerHTML = ""

    filteredProducts.forEach((product) => {
      const productCard = document.createElement("div")
      productCard.className = "col-md-4 mb-4"
      productCard.innerHTML = `
                <div class="card product-card">
                    <img src="${product.imageUrl || "/Content/images/placeholder.jpg"}" class="card-img-top product-image" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <a href="/Content/product-detail.html?id=${product.id}" class="btn btn-outline-primary">View Details</a>
                    </div>
                </div>
            `
      relatedProducts.appendChild(productCard)
    })
  } catch (error) {
    console.error("Error loading related products:", error)
    relatedProducts.innerHTML = "<p>Error loading related products.</p>"
  }
}

// Add to cart with quantity
function addToCartWithQuantity(product, quantity) {
  const cart = JSON.parse(localStorage.getItem(CART_KEY)) || []

  const existingItem = cart.find((item) => item.id === product.id.toString())
  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.imageUrl || "/Content/images/placeholder.jpg",
      quantity: quantity,
    })
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  updateCartCount()

  // Show success message
  alert(`${product.name} has been added to your cart.`)
}

// Dummy functions for loadCategories and updateCartCount
function loadCategories() {
  // Implement your logic to load categories here
  console.log("loadCategories function called")
}

function updateCartCount() {
  // Implement your logic to update cart count here
  console.log("updateCartCount function called")
}
