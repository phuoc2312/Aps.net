document.addEventListener("DOMContentLoaded", () => {
  // Check if user is admin
  if (!requireAdmin()) {
    return
  }

  // Load products
  loadProducts()

  // Load categories for dropdowns
  loadCategoriesForDropdown()

  // Add event listeners
  document.getElementById("saveProductBtn").addEventListener("click", saveProduct)
  document.getElementById("updateProductBtn").addEventListener("click", updateProduct)
})

// Dummy declarations for the missing variables. Replace with actual imports or declarations.
const requireAdmin = () => true // Replace with actual admin check logic
const API_BASE_URL = "https://localhost:7070/api" // Replace with your actual API base URL
const addAuthHeader = () => ({ headers: {} }) // Replace with your actual authentication header logic
const bootstrap = window.bootstrap // Assuming bootstrap is loaded globally

// Load products
async function loadProducts() {
  const productsList = document.getElementById("productsList")
  if (!productsList) return

  try {
    const response = await fetch(`${API_BASE_URL}/Products`, addAuthHeader())
    const products = await response.json()

    if (products.length === 0) {
      productsList.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>'
      return
    }

    productsList.innerHTML = ""

    products.forEach((product) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.imageUrl || "/Content/images/placeholder.jpg"}" alt="${product.name}" class="img-thumbnail"></td>
                <td>${product.name}</td>
                <td>${product.category ? product.category.name : "Uncategorized"}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">Delete</button>
                </td>
            `
      productsList.appendChild(row)
    })

    // Add event listeners to buttons
    document.querySelectorAll(".edit-product").forEach((button) => {
      button.addEventListener("click", () => editProduct(button.getAttribute("data-id")))
    })

    document.querySelectorAll(".delete-product").forEach((button) => {
      button.addEventListener("click", () => deleteProduct(button.getAttribute("data-id")))
    })
  } catch (error) {
    console.error("Error loading products:", error)
    productsList.innerHTML = '<tr><td colspan="6" class="text-center">Error loading products</td></tr>'
  }
}

// Load categories for dropdown
async function loadCategoriesForDropdown() {
  try {
    const response = await fetch(`${API_BASE_URL}/Categories`, addAuthHeader())
    const categories = await response.json()

    const productCategory = document.getElementById("productCategory")
    const editProductCategory = document.getElementById("editProductCategory")

    if (productCategory) {
      productCategory.innerHTML = '<option value="">Select Category</option>'

      categories.forEach((category) => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        productCategory.appendChild(option)
      })
    }

    if (editProductCategory) {
      editProductCategory.innerHTML = '<option value="">Select Category</option>'

      categories.forEach((category) => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        editProductCategory.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

// Save product
async function saveProduct() {
  const name = document.getElementById("productName").value
  const description = document.getElementById("productDescription").value
  const price = Number.parseFloat(document.getElementById("productPrice").value)
  const categoryId = Number.parseInt(document.getElementById("productCategory").value)
  const imageUrl = document.getElementById("productImage").value

  if (!name || !price || !categoryId) {
    alert("Please fill in all required fields")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...addAuthHeader().headers,
      },
      body: JSON.stringify({
        name,
        description,
        price,
        categoryId,
        imageUrl,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to save product")
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("addProductModal"))
    modal.hide()

    // Reset form
    document.getElementById("addProductForm").reset()

    // Reload products
    loadProducts()

    // Show success message
    alert("Product saved successfully")
  } catch (error) {
    console.error("Error saving product:", error)
    alert("Failed to save product")
  }
}

// Edit product
async function editProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/Products/${productId}`, addAuthHeader())
    const product = await response.json()

    // Fill form
    document.getElementById("editProductId").value = product.id
    document.getElementById("editProductName").value = product.name
    document.getElementById("editProductDescription").value = product.description || ""
    document.getElementById("editProductPrice").value = product.price
    document.getElementById("editProductCategory").value = product.categoryId
    document.getElementById("editProductImage").value = product.imageUrl || ""

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("editProductModal"))
    modal.show()
  } catch (error) {
    console.error("Error loading product:", error)
    alert("Failed to load product")
  }
}

// Update product
async function updateProduct() {
  const id = document.getElementById("editProductId").value
  const name = document.getElementById("editProductName").value
  const description = document.getElementById("editProductDescription").value
  const price = Number.parseFloat(document.getElementById("editProductPrice").value)
  const categoryId = Number.parseInt(document.getElementById("editProductCategory").value)
  const imageUrl = document.getElementById("editProductImage").value

  if (!name || !price || !categoryId) {
    alert("Please fill in all required fields")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...addAuthHeader().headers,
      },
      body: JSON.stringify({
        id,
        name,
        description,
        price,
        categoryId,
        imageUrl,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update product")
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("editProductModal"))
    modal.hide()

    // Reload products
    loadProducts()

    // Show success message
    alert("Product updated successfully")
  } catch (error) {
    console.error("Error updating product:", error)
    alert("Failed to update product")
  }
}

// Delete product
async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) {
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Products/${productId}`, {
      method: "DELETE",
      ...addAuthHeader(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete product")
    }

    // Reload products
    loadProducts()

    // Show success message
    alert("Product deleted successfully")
  } catch (error) {
    console.error("Error deleting product:", error)
    alert("Failed to delete product")
  }
}
