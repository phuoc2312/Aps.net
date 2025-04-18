// Content/js/admin/orders.js
document.addEventListener('DOMContentLoaded', async () => {
    const ordersList = document.getElementById('ordersList');
    const viewOrderModal = new bootstrap.Modal(document.getElementById('viewOrderModal'));

    async function fetchData(url, options = {}) {
        const response = await fetch(`http://localhost:5021${url}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        if (!response.ok) {
            throw new Error(`Request failed: ${response.statusText}`);
        }
        return response.json();
    }

    try {
        const orders = await fetchData('/api/orders');
        ordersList.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.user ? order.user.username : 'N/A'}</td>
                <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                <td>$${order.totalAmount.toFixed(2)}</td>
                <td>${order.status}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-order" data-id="${order.id}">View</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.view-order').forEach(button => {
            button.addEventListener('click', async () => {
                const orderId = button.dataset.id;
                try {
                    const order = await fetchData(`/api/orders/${orderId}`);
                    document.getElementById('orderIdDetail').textContent = order.id;
                    document.getElementById('orderDateDetail').textContent = new Date(order.orderDate).toLocaleString();
                    document.getElementById('orderStatusDetail').textContent = order.status;
                    document.getElementById('orderTotalDetail').textContent = order.totalAmount.toFixed(2);
                    document.getElementById('customerNameDetail').textContent = order.user ? order.user.username : 'N/A';
                    document.getElementById('customerEmailDetail').textContent = order.user ? order.user.email : 'N/A';

                    const itemsTable = document.getElementById('orderItemsDetail');
                    itemsTable.innerHTML = order.orderDetails.map(item => `
                        <tr>
                            <td>${item.product ? item.product.name : 'N/A'}</td>
                            <td>$${item.unitPrice.toFixed(2)}</td>
                            <td>${item.quantity}</td>
                            <td>$${(item.unitPrice * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('');

                    viewOrderModal.show();

                    document.querySelectorAll('.status-option').forEach(option => {
                        option.addEventListener('click', async () => {
                            try {
                                await fetchData(`/api/orders/${orderId}`, {
                                    method: 'PUT',
                                    body: JSON.stringify({ ...order, status: option.dataset.status })
                                });
                                viewOrderModal.hide();
                                window.location.reload();
                            } catch (error) {
                                console.error('Error updating order status:', error);
                                alert('Failed to update order status: ' + error.message);
                            }
                        });
                    });
                } catch (error) {
                    console.error('Error loading order details:', error);
                    alert('Failed to load order details: ' + error.message);
                }
            });
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        alert('Failed to load orders: ' + error.message);
    }
});