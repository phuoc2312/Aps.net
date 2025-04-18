// Content/js/admin/users.js
document.addEventListener('DOMContentLoaded', async () => {
    const usersList = document.getElementById('usersList');
    const addUserForm = document.getElementById('addUserForm');
    const editUserForm = document.getElementById('editUserForm');
    const addModal = new bootstrap.Modal(document.getElementById('addUserModal'));
    const editModal = new bootstrap.Modal(document.getElementById('editUserModal'));

    async function fetchData(url, options = {}) {
        const response = await fetch(`http://localhost:5021${url}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Request failed: ${response.statusText}`);
        }
        return response.json();
    }

    function validateUserForm({ username, email, password, fullName, address, phone }) {
        if (!username || username.trim().length < 3) {
            return 'Username is required and must be at least 3 characters.';
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'A valid email is required.';
        }
        if (password && password.length < 6) {
            return 'Password must be at least 6 characters.';
        }
        return null;
    }

    async function loadUsers() {
        try {
            const users = await fetchData('/api/users');
            usersList.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.fullName || 'N/A'}</td>
                    <td>${user.isAdmin ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-user" data-id="${user.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">Delete</button>
                    </td>
                </tr>
            `).join('');

            // Xử lý sự kiện bằng event delegation
            usersList.addEventListener('click', async (event) => {
                const target = event.target;
                if (target.classList.contains('edit-user')) {
                    const id = target.dataset.id;
                    try {
                        const user = await fetchData(`/api/users/${id}`);
                        document.getElementById('editUserId').value = user.id;
                        document.getElementById('editUsername').value = user.username;
                        document.getElementById('editEmail').value = user.email;
                        document.getElementById('editFullName').value = user.fullName || '';
                        document.getElementById('editAddress').value = user.address || '';
                        document.getElementById('editPhone').value = user.phone || '';
                        editModal.show();
                    } catch (error) {
                        console.error('Error loading user:', error);
                        alert('Failed to load user: ' + error.message);
                    }
                } else if (target.classList.contains('delete-user')) {
                    if (confirm('Are you sure you want to delete this user?')) {
                        try {
                            await fetchData(`/api/users/${target.dataset.id}`, { method: 'DELETE' });
                            loadUsers();
                        } catch (error) {
                            console.error('Error deleting user:', error);
                            alert('Failed to delete user: ' + error.message);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Failed to load users: ' + error.message);
        }
    }

    document.getElementById('saveUserBtn').addEventListener('click', async () => {
        try {
            const user = {
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                fullName: document.getElementById('fullName').value.trim(),
                password: document.getElementById('password').value,
                address: document.getElementById('address').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                isAdmin: true
            };

            const validationError = validateUserForm(user);
            if (validationError) {
                alert(validationError);
                return;
            }

            await fetchData('/api/users', {
                method: 'POST',
                body: JSON.stringify(user)
            });
            addModal.hide();
            addUserForm.reset();
            loadUsers();
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user: ' + error.message);
        }
    });

    document.getElementById('updateUserBtn').addEventListener('click', async () => {
        try {
            const user = {
                id: parseInt(document.getElementById('editUserId').value),
                username: document.getElementById('editUsername').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                fullName: document.getElementById('editFullName').value.trim(),
                address: document.getElementById('editAddress').value.trim(),
                phone: document.getElementById('editPhone').value.trim(),
                isAdmin: true
            };

            const validationError = validateUserForm({ ...user, password: 'dummy' }); // Password không bắt buộc khi sửa
            if (validationError) {
                alert(validationError);
                return;
            }

            await fetchData(`/api/users/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify(user)
            });
            editModal.hide();
            loadUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user: ' + error.message);
        }
    });

    // Xóa dữ liệu modal khi đóng
    addModal._element.addEventListener('hidden.bs.modal', () => {
        addUserForm.reset();
    });

    editModal._element.addEventListener('hidden.bs.modal', () => {
        editUserForm.reset();
    });

    loadUsers();
});