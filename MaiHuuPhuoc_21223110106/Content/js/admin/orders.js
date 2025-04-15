document.addEventListener("DOMContentLoaded", () => {
    // Check if user is admin
    if (!requireAdmin()) {
        return;
    }

    // Load orders
    loadOrders();
});

// API base URL
const API_BASE_URL = "/api";

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

// Load orders
async function loadOrders() {
    const ordersList = document.getElementById("ordersList");
    if (!ordersList) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, addAuthHeader());
        if (!response.ok) throw new Error("Failed to fetch orders");
        const orders = await response.json();

        // Sort orders by date (newest first)
        const sortedOrders = orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        if (sortedOrders.length === 0) {
            ordersList.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
            return;
        }

        ordersList.innerHTML = "";

        sortedOrders.forEach((order) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${order.id}</td>
        <td>${order.customerName || "Guest"}</td>
        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
        <td>$${order.total.toFixed(2)}</td>
        <td><span class="badge bg-${getStatusBadgeColor(order.status)}">${order.status}</span></td>
        <td>
          <button class="btn btn-sm btn-primary view-order" data-id="${order.id}">View</button>
          <button class="btn btn-sm btn-danger delete-order" data-id="${order.id}">Delete</button>
        </td>
      `;
            ordersList.appendChild(row);
        });

        // Add event listeners to buttons
        document.querySelectorAll(".view-order").forEach((button) => {
            button.addEventListener("click", () => viewOrder(button.getAttribute("data-id")));
        });

        document.querySelectorAll(".delete-order").forEach((button) => {
            button.addEventListener("click", () => deleteOrder(button.getAttribute("data-id")));
        });

        // Add event listeners for status options
        document.querySelectorAll(".status-option").forEach((option) => {
            option.addEventListener("click", (e) => {
                e.preventDefault();
                updateOrderStatus(option.getAttribute("data-status"));
            });
        });
    } catch (error) {
        console.error("Error loading orders:", error);
        ordersList.innerHTML = '<tr><td colspan="6" class="text-center">Error loading orders</td></tr>';
    }
}

// View order
async function viewOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, addAuthHeader());
        if (!response.ok) throw new Error("Failed to fetch order");
        const order = await response.json();

        // Set order details in modal
        document.getElementById("orderIdDetail").textContent = order.id;
        document.getElementById("orderDateDetail").textContent = new Date(order.orderDate).toLocaleString();
        document.getElementById("orderStatusDetail").textContent = order.status;
        document.getElementById("orderTotalDetail").textContent = order.total.toFixed(2);

        // Set customer details
        document.getElementById("customerNameDetail").textContent = order.customerName || "Guest";
        document.getElementById("customerEmailDetail").textContent = order.customerEmail || "N/A";
        document.getElementById("shippingAddressDetail").textContent = order.shippingAddress || "N/A";

        // Set order items
        const orderItemsDetail = document.getElementById("orderItemsDetail");
        orderItemsDetail.innerHTML = "";

        if (order.items && order.items.length > 0) {
            order.items.forEach((item) => {
                const row = document.createElement("tr");
                row.innerHTML = `
          <td>${item.productName || "Unknown Product"}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>${item.quantity}</td>
          <td>$${(item.price * item.quantity).toFixed(2)}</td>
        `;
                orderItemsDetail.appendChild(row);
            });
        } else {
            orderItemsDetail.innerHTML = '<tr><td colspan="4" class="text-center">No items found</td></tr>';
        }

        // Store order ID for status update
        document.getElementById("updateStatusDropdown").setAttribute("data-order-id", order.id);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById("viewOrderModal"));
        modal.show();
    } catch (error) {
        console.error("Error loading order:", error);
        alert("Failed to load order details");
    }
}

// Update order status
async function updateOrderStatus(status) {
    const orderId = document.getElementById("updateStatusDropdown").getAttribute("data-order-id");
    if (!orderId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...addAuthHeader().headers,
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            throw new Error("Failed to update order status");
        }

        // Update the status in the modal
        document.getElementById("orderStatusDetail").textContent = status;

        // Reload orders
        loadOrders();

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("viewOrderModal"));
        modal.hide();

        // Show success message
        alert("Order status updated successfully");
    } catch (error) {
        console.error("Error updating order status:", error);
        alert("Failed to update order status");
    }
}

// Delete order
async function deleteOrder(orderId) {
    if (!confirm("Are you sure you want to delete this order?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: "DELETE",
            ...addAuthHeader(),
        });

        if (!response.ok) {
            throw new Error("Failed to delete order");
        }

        // Reload orders
        loadOrders();

        // Show success message
        alert("Order deleted successfully");
    } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order");
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