document.addEventListener("DOMContentLoaded", () => {
    // Check if user is admin
    if (!requireAdmin()) {
        return;
    }

    // Load categories
    loadCategories();

    // Add event listeners
    document.getElementById("saveCategoryBtn").addEventListener("click", saveCategory);
    document.getElementById("updateCategoryBtn").addEventListener("click", updateCategory);
});

// API base URL
const API_BASE_URL = "/api"; // Cập nhật để dùng endpoint nội bộ

// Check admin logic (giữ nguyên)
const requireAdmin = () => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
        console.warn("Unauthorized access: Admin privileges required.");
        window.location.href = "/content/login.html"; // Điều hướng về trang login
        return false;
    }
    return true;
};

// Add auth header (giữ nguyên)
const addAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (token) {
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        };
    }
    return {
        headers: {
            "Content-Type": "application/json",
        },
    };
};

// Load categories
async function loadCategories() {
    const categoriesList = document.getElementById("categoriesList");
    if (!categoriesList) return;

    try {
        const response = await fetch(`${API_BASE_URL}/category`, addAuthHeader());
        if (!response.ok) throw new Error("Failed to fetch categories");
        const categories = await response.json();

        if (categories.length === 0) {
            categoriesList.innerHTML = '<tr><td colspan="4" class="text-center">No categories found</td></tr>';
            return;
        }

        categoriesList.innerHTML = "";

        categories.forEach((category) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${category.id}</td>
        <td>${category.name}</td>
        <td>${category.description || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-category" data-id="${category.id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-category" data-id="${category.id}">Delete</button>
        </td>
      `;
            categoriesList.appendChild(row);
        });

        // Add event listeners to buttons
        document.querySelectorAll(".edit-category").forEach((button) => {
            button.addEventListener("click", () => editCategory(button.getAttribute("data-id")));
        });

        document.querySelectorAll(".delete-category").forEach((button) => {
            button.addEventListener("click", () => deleteCategory(button.getAttribute("data-id")));
        });
    } catch (error) {
        console.error("Error loading categories:", error);
        categoriesList.innerHTML = '<tr><td colspan="4" class="text-center">Error loading categories</td></tr>';
    }
}

// Save category
async function saveCategory() {
    const name = document.getElementById("categoryName").value;
    const description = document.getElementById("categoryDescription").value;

    if (!name) {
        alert("Please enter a category name");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/category`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...addAuthHeader().headers,
            },
            body: JSON.stringify({
                name,
                description,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to save category");
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("addCategoryModal"));
        modal.hide();

        // Reset form
        document.getElementById("addCategoryForm").reset();

        // Reload categories
        loadCategories();

        // Show success message
        alert("Category saved successfully");
    } catch (error) {
        console.error("Error saving category:", error);
        alert("Failed to save category");
    }
}

// Edit category
async function editCategory(categoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, addAuthHeader());
        if (!response.ok) throw new Error("Failed to fetch category");
        const category = await response.json();

        // Fill form
        document.getElementById("editCategoryId").value = category.id;
        document.getElementById("editCategoryName").value = category.name;
        document.getElementById("editCategoryDescription").value = category.description || "";

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById("editCategoryModal"));
        modal.show();
    } catch (error) {
        console.error("Error loading category:", error);
        alert("Failed to load category");
    }
}

// Update category
async function updateCategory() {
    const id = document.getElementById("editCategoryId").value;
    const name = document.getElementById("editCategoryName").value;
    const description = document.getElementById("editCategoryDescription").value;

    if (!name) {
        alert("Please enter a category name");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/category/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...addAuthHeader().headers,
            },
            body: JSON.stringify({
                name,
                description,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to update category");
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("editCategoryModal"));
        modal.hide();

        // Reload categories
        loadCategories();

        // Show success message
        alert("Category updated successfully");
    } catch (error) {
        console.error("Error updating category:", error);
        alert("Failed to update category");
    }
}

// Delete category
async function deleteCategory(categoryId) {
    if (!confirm("Are you sure you want to delete this category?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, {
            method: "DELETE",
            ...addAuthHeader(),
        });

        if (!response.ok) {
            throw new Error("Failed to delete category");
        }

        // Reload categories
        loadCategories();

        // Show success message
        alert("Category deleted successfully");
    } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category");
    }
}