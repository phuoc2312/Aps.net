// Content/js/admin/categories.js
document.addEventListener('DOMContentLoaded', async () => {
    const categoriesList = document.getElementById('categoriesList');
    const addCategoryForm = document.getElementById('addCategoryForm');
    const editCategoryForm = document.getElementById('editCategoryForm');
    const addModal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
    const editModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));

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

    async function loadCategories() {
        try {
            const categories = await fetchData('/api/categories');
            categoriesList.innerHTML = categories.map(category => `
                <tr>
                    <td>${category.id}</td>
                    <td>${category.name}</td>
                    <td>${category.description || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-category" data-id="${category.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-category" data-id="${category.id}">Delete</button>
                    </td>
                </tr>
            `).join('');

            document.querySelectorAll('.edit-category').forEach(button => {
                button.addEventListener('click', async () => {
                    const id = button.dataset.id;
                    try {
                        const category = await fetchData(`/api/categories/${id}`);
                        document.getElementById('editCategoryId').value = category.id;
                        document.getElementById('editCategoryName').value = category.name;
                        document.getElementById('editCategoryDescription').value = category.description || '';
                        editModal.show();
                    } catch (error) {
                        console.error('Error loading category:', error);
                        alert('Failed to load category: ' + error.message);
                    }
                });
            });

            document.querySelectorAll('.delete-category').forEach(button => {
                button.addEventListener('click', async () => {
                    if (confirm('Are you sure you want to delete this category?')) {
                        try {
                            await fetchData(`/api/categories/${button.dataset.id}`, { method: 'DELETE' });
                            loadCategories();
                        } catch (error) {
                            console.error('Error deleting category:', error);
                            alert('Failed to delete category: ' + error.message);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('Failed to load categories: ' + error.message);
        }
    }

    document.getElementById('saveCategoryBtn').addEventListener('click', async () => {
        try {
            const category = {
                name: document.getElementById('categoryName').value,
                description: document.getElementById('categoryDescription').value
            };
            await fetchData('/api/categories', {
                method: 'POST',
                body: JSON.stringify(category)
            });
            addModal.hide();
            addCategoryForm.reset();
            loadCategories();
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category: ' + error.message);
        }
    });

    document.getElementById('updateCategoryBtn').addEventListener('click', async () => {
        try {
            const category = {
                id: parseInt(document.getElementById('editCategoryId').value),
                name: document.getElementById('editCategoryName').value,
                description: document.getElementById('editCategoryDescription').value
            };
            await fetchData(`/api/categories/${category.id}`, {
                method: 'PUT',
                body: JSON.stringify(category)
            });
            editModal.hide();
            loadCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Failed to update category: ' + error.message);
        }
    });

    loadCategories();
});