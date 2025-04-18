// Content/js/admin/products.js
document.addEventListener('DOMContentLoaded', async () => {
    const productsList = document.getElementById('productsList');
    const addProductForm = document.getElementById('addProductForm');
    const editProductForm = document.getElementById('editProductForm');
    const addModal = new bootstrap.Modal(document.getElementById('addProductModal'));
    const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));

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
            const addCategorySelect = document.getElementById('productCategory');
            const editCategorySelect = document.getElementById('editProductCategory');
            addCategorySelect.innerHTML = '<option value="">Select Category</option>' +
                categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('');
            editCategorySelect.innerHTML = addCategorySelect.innerHTML;
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('Failed to load categories: ' + error.message);
        }
    }

    async function loadProducts() {
        try {
            const products = await fetchData('/api/products');
            productsList.innerHTML = products.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td><img src="${product.imageUrl || '/content/images/placeholder.jpg'}" alt="${product.name}" style="width: 50px;"></td>
                    <td>${product.name}</td>
                    <td>${product.category ? product.category.name : 'N/A'}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">Delete</button>
                    </td>
                </tr>
            `).join('');

            document.querySelectorAll('.edit-product').forEach(button => {
                button.addEventListener('click', async () => {
                    const id = button.dataset.id;
                    try {
                        const product = await fetchData(`/api/products/${id}`);
                        document.getElementById('editProductId').value = product.id;
                        document.getElementById('editProductName').value = product.name;
                        document.getElementById('editProductDescription').value = product.description || '';
                        document.getElementById('editProductPrice').value = product.price;
                        document.getElementById('editProductCategory').value = product.categoryId;
                        const currentImage = document.getElementById('currentImage');
                        currentImage.src = product.imageUrl || '/content/images/placeholder.jpg';
                        currentImage.style.display = product.imageUrl ? 'block' : 'none';
                        editModal.show();
                    } catch (error) {
                        console.error('Error loading product:', error);
                        alert('Failed to load product: ' + error.message);
                    }
                });
            });

            document.querySelectorAll('.delete-product').forEach(button => {
                button.addEventListener('click', async () => {
                    if (confirm('Are you sure you want to delete this product?')) {
                        try {
                            await fetchData(`/api/products/${button.dataset.id}`, { method: 'DELETE' });
                            loadProducts();
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            alert('Failed to delete product: ' + error.message);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Failed to load products: ' + error.message);
        }
    }

    document.getElementById('saveProductBtn').addEventListener('click', async () => {
        try {
            const product = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: parseFloat(document.getElementById('productPrice').value),
                categoryId: parseInt(document.getElementById('productCategory').value)
            };
            const file = document.getElementById('productImage').files[0];

            const newProduct = await fetchData('/api/products', {
                method: 'POST',
                body: JSON.stringify(product)
            });

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadResponse = await fetch('http://localhost:5021/api/products/Upload', {
                    method: 'POST',
                    body: formData
                });
                if (!uploadResponse.ok) throw new Error('Image upload failed');
                const uploadResult = await uploadResponse.json();
                await fetchData(`/api/products/${newProduct.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ ...newProduct, imageUrl: uploadResult.imageUrl })
                });
            }

            addModal.hide();
            addProductForm.reset();
            loadProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product: ' + error.message);
        }
    });

    document.getElementById('updateProductBtn').addEventListener('click', async () => {
        try {
            const product = {
                id: parseInt(document.getElementById('editProductId').value),
                name: document.getElementById('editProductName').value,
                description: document.getElementById('editProductDescription').value,
                price: parseFloat(document.getElementById('editProductPrice').value),
                categoryId: parseInt(document.getElementById('editProductCategory').value)
            };
            const file = document.getElementById('editProductImage').files[0];

            let imageUrl = document.getElementById('currentImage').src;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadResponse = await fetch('http://localhost:5021/api/products/Upload', {
                    method: 'POST',
                    body: formData
                });
                if (!uploadResponse.ok) throw new Error('Image upload failed');
                const uploadResult = await uploadResponse.json();
                imageUrl = uploadResult.imageUrl;
            }

            await fetchData(`/api/products/${product.id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...product, imageUrl })
            });

            editModal.hide();
            loadProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product: ' + error.message);
        }
    });

    loadCategories();
    loadProducts();
});