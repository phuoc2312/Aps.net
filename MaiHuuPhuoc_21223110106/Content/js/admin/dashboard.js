// Content/js/admin/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    async function fetchData(url, options = {}) {
        try {
            const response = await fetch(`http://localhost:5021${url}`, {
                ...options,
                headers: { 'Content-Type': 'application/json', ...options.headers }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request to ${url} failed: ${response.statusText} - ${errorText}`);
            }
            return response.json();
        } catch (error) {
            if (error.message.includes('CORS')) {
                throw new Error(`CORS error for ${url}: Ensure backend allows origin https://localhost:7147`);
            }
            throw new Error(`Failed to fetch ${url}: ${error.message}`);
        }
    }

    async function loadDashboardData() {
        const errorMessages = [];

        try {
            // Lấy tổng số sản phẩm
            const products = await fetchData('/api/products').catch(err => {
                errorMessages.push(err.message);
                return [];
            });
            document.getElementById('totalProducts').textContent = products.length || 'N/A';

            // Lấy tổng số danh mục
            const categories = await fetchData('/api/categories').catch(err => {
                errorMessages.push(err.message);
                return [];
            });
            document.getElementById('totalCategories').textContent = categories.length || 'N/A';

            // Lấy tổng số đơn hàng
            const orders = await fetchData('/api/orders').catch(err => {
                errorMessages.push(err.message);
                return [];
            });
            document.getElementById('totalOrders').textContent = orders.length || 'N/A';

            // Lấy tổng số người dùng
            const users = await fetchData('/api/users').catch(err => {
                errorMessages.push(err.message);
                return [];
            });
            document.getElementById('totalUsers').textContent = users.length || 'N/A';

            // Lấy 5 đơn hàng gần đây
            const recentOrders = orders.slice(0, 5);
            const recentOrdersTable = document.getElementById('recentOrders');
            recentOrdersTable.innerHTML = recentOrders.length > 0
                ? recentOrders.map(order => `
                    <tr>
                        <td>${order.id}</td>
                        <td>${order.user ? order.user.username : 'N/A'}</td>
                        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>$${order.totalAmount.toFixed(2)}</td>
                        <td>${order.status}</td>
                    </tr>
                `).join('')
                : '<tr><td colspan="5">No recent orders available</td></tr>';

            if (errorMessages.length > 0) {
                alert('Some data failed to load:\n' + errorMessages.join('\n'));
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            alert('Failed to load dashboard data: ' + error.message);
        }
    }

    loadDashboardData();
});