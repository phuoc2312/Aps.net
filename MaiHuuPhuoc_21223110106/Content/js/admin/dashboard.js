document.addEventListener("DOMContentLoaded", () => {
    // Check if user is admin
    if (!requireAdmin()) {
        return;
    }

    // Load dashboard data
    loadDashboardData();

    // Load recent orders
    loadRecentOrders();
});

// Declare variables
const API_BASE_URL = "/api"; // Đã đúng

const requireAdmin = () => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
        console.warn("Unauthorized access: Admin privileges required.");
        window.location.href = "/content/login.html";
        return false;
    }
    return true;
};

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

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load products count
        const productsResponse = await fetch(`${API_BASE_URL}/products`, addAuthHeader());
        if (!productsResponse.ok) throw new Error("Failed to fetch products");
        const products = await productsResponse.json();
        document.getElementById("totalProducts").textContent = products.length;

        // Load categories count
        const categoriesResponse = await fetch(`${API_BASE_URL}/category`, addAuthHeader());
        if (!categoriesResponse.ok) throw new Error("Failed to fetch categories");
        const categories = await categoriesResponse.json();
        document.getElementById("totalCategories").textContent = categories.length;

        // Load orders count
        const ordersResponse = await fetch(`${API_BASE_URL}/orders`, addAuthHeader());
        if (!ordersResponse.ok) throw new Error("Failed to fetch orders");
        const orders = await ordersResponse.json();
        document.getElementById("totalOrders").textContent = orders.length;

        // Load users count
        const usersResponse = await fetch(`${API_BASE_URL}/users`, addAuthHeader());
        if (!usersResponse.ok) throw new Error("Failed to fetch users");
        const users = await usersResponse.json();
        document.getElementById("totalUsers").textContent = users.length;
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

// Load recent orders
async function loadRecentOrders() {
    const recentOrders = document.getElementById("recentOrders");
    if (!recentOrders) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, addAuthHeader());
        if (!response.ok) throw new Error("Failed to fetch orders");
        const orders = await response.json();

        // Sort orders by date (newest first) and take the first 5
        const sortedOrders = orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 5);

        if (sortedOrders.length === 0) {
            recentOrders.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
            return;
        }

        recentOrders.innerHTML = "";

        sortedOrders.forEach((order) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${order.id}</td>
        <td>${order.customerName || "Guest"}</td>
        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
        <td>$${order.total.toFixed(2)}</td>
        <td><span class="badge bg-${getStatusBadgeColor(order.status)}">${order.status}</span></td>
      `;
            recentOrders.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading recent orders:", error);
        recentOrders.innerHTML = '<tr><td colspan="5" class="text-center">Error loading orders</td></tr>';
    }
}

// Get status badge color
function getStatusBadgeColor(status) {
    switch (status.toLowerCase()) {
        case "pending":
            return "warning";
        case "processing":
            return "info";
        case "shipped":
            return "primary";
        case "delivered":
            return "success";
        case "cancelled":
            return "danger";
        default:
            return "secondary";
    }
}