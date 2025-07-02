// URL base de la API
const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const productForm = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const imageInput = document.getElementById('imagen');
const imagePreview = document.getElementById('imagePreview');
const productsTable = document.getElementById('productsBody');
let editingProductId = null;

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Vista previa de la imagen
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Enviar formulario (Crear o Actualizar)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const precio_venta = document.getElementById('precio_venta').value;
    const descripcion = document.getElementById('descripcion').value;
    const entrada = document.getElementById('entrada').value || 0;
    const salida = document.getElementById('salida').value || 0;
    let imagenBase64 = null;

    // Convertir imagen a base64 si se seleccionó una
    if (imageInput.files[0]) {
        const reader = new FileReader();
        imagenBase64 = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result.split(',')[1]); // Obtener solo la parte base64
            reader.readAsDataURL(imageInput.files[0]);
        });
    }

    const productData = {
        nombre,
        precio_venta,
        descripcion,
        entrada,
        salida,
        imagenBase64
    };
    console.log('Datos enviados al actualizar:', productData); // se agrega log

    try {
        if (editingProductId) {
            await updateProduct(editingProductId, productData);
            alert('Producto actualizado correctamente');
        } else {
            await createProduct(productData);
            alert('Producto creado correctamente');
        }
        resetForm();
        loadProducts();
    } catch (error) {
        console.error('Error detallado:', error);
        alert(error.message); // Mostrar el mensaje de error específico
    }
});

// Cancelar edición
cancelBtn.addEventListener('click', () => {
    resetForm();
});

// Crear producto
async function createProduct(productData) {
    const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Error al crear');
    return await response.json();
}

// Obtener todos los productos
async function loadProducts() {
    const response = await fetch(`${API_URL}/productos`);
    const products = await response.json();
    renderProducts(products);
}

// Actualizar producto
async function updateProduct(id, productData) {
    const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al actualizar: ${errorData.error || response.statusText}`);
    }
    return await response.json();
}

// Desactivar producto
async function deactivateProduct(id) {
    const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Error al desactivar');
    loadProducts();
    alert('Producto desactivado correctamente');
}

// Renderizar productos en la tabla
function renderProducts(products) {
    productsTable.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2 border">${product.id_producto}</td>
            <td class="p-2 border">${product.nombre}</td>
            <td class="p-2 border">${product.precio_venta}</td>
            <td class="p-2 border">${product.saldo}</td>
            <td class="p-2 border"><img src="data:image/jpeg;base64,${product.imagen || ''}" alt="${product.nombre}" class="w-16 h-16 object-cover"></td>
            <td class="p-2 border">
                <button onclick="editProduct(${product.id_producto})" class="bg-yellow-500 text-white p-1 rounded">Editar</button>
                <button onclick="deactivateProduct(${product.id_producto})" class="bg-red-500 text-white p-1 rounded ml-2">Desactivar</button>
            </td>
        `;
        productsTable.appendChild(row);
    });
}

// Editar producto
async function editProduct(id) {
    const response = await fetch(`${API_URL}/productos/${id}`);
    const product = await response.json();
    document.getElementById('nombre').value = product.nombre;
    document.getElementById('precio_venta').value = product.precio_venta;
    document.getElementById('descripcion').value = product.descripcion || '';
    document.getElementById('entrada').value = product.entrada;
    document.getElementById('salida').value = product.salida;
    if (product.imagen) {
        imagePreview.src = `data:image/jpeg;base64,${product.imagen}`;
        imagePreview.classList.remove('hidden');
    }
    formTitle.textContent = 'Editar Producto';
    submitBtn.textContent = 'Actualizar';
    cancelBtn.classList.remove('hidden');
    editingProductId = id;
}

// Resetear formulario
function resetForm() {
    productForm.reset();
    imagePreview.classList.add('hidden');
    imagePreview.src = '';
    formTitle.textContent = 'Añadir Nuevo Producto';
    submitBtn.textContent = 'Guardar';
    cancelBtn.classList.add('hidden');
    editingProductId = null;
}