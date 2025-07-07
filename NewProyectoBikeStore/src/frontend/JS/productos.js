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
const showFormBtn = document.getElementById('showFormBtn');
const formContainer = document.getElementById('formContainer');
const modalFormBg = document.getElementById('modalFormBg');
const closeFormModal = document.getElementById('closeFormModal');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
let editingProductId = null;
let currentSalida = 0; // Variable para almacenar el valor de salida actual al editar
let allProducts = [];

// header usuario
const userProfileProductos = document.getElementById('userProfileProductos');
const profileModalProductos = document.getElementById('profileModalProductos');
const profileUserNameProductos = document.getElementById('profileUserNameProductos');
const btnCerrarSesionModalProductos = document.getElementById('btnCerrarSesionModalProductos');
let usuarioAutenticado = false;

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    verificarAutenticacionProductos();
});

// Cerrar sesión
btnCerrarSesionModalProductos.addEventListener('click', function () {
    localStorage.clear();
    usuarioAutenticado = false;
    closeProfileModalProductos();
    verificarAutenticacionProductos();
    window.location.href = '../HTML/index_login.html';
});

// Cerrar modal al hacer click fuera
window.onclick = function (event) {
    if (event.target === profileModalProductos) {
        closeProfileModalProductos();
    }
};

// Mostrar el formulario al hacer clic en "Agregar producto"
showFormBtn.addEventListener('click', () => {
    resetForm();
    modalFormBg.classList.remove('oculto');
    showFormBtn.classList.add('oculto');
});

// Botón para cerrar el modal
closeFormModal.addEventListener('click', () => {
    modalFormBg.classList.add('oculto');
    showFormBtn.classList.remove('oculto');
});

// Cerrar modal al hacer clic fuera del formulario
modalFormBg.addEventListener('click', (event) => {
    if (event.target === modalFormBg) {
        modalFormBg.classList.add('oculto');
        showFormBtn.classList.remove('oculto');
    }
});

function closeProfileModalProductos() {
    profileModalProductos.style.display = 'none';
}

// Agrego función para filtrar productos
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = allProducts.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm))
    );
    renderProducts(filtered);
}

// Eventos de búsqueda
if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', filterProducts);
    searchInput.addEventListener('input', filterProducts);
}

// Vista previa de la imagen
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.classList.remove('oculto');
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
    const salida = editingProductId ? currentSalida : 0; // Usar salida de la BD o 0 para nuevos productos
    let imagenBase64 = null;

    // Convertir imagen a base64 si se seleccionó una
    if (imageInput.files[0]) {
        const reader = new FileReader();
        imagenBase64 = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result.split(',')[1]);
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
    console.log('Datos enviados al actualizar:', productData);

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
        alert(error.message);
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
    allProducts = products;
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
    alert('Producto eliminado correctamente');
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
                <button onclick="deactivateProduct(${product.id_producto})" class="bg-red-500 text-white p-1 rounded ml-2">Eliminar</button>
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
    document.getElementById('salida').value = product.salida || 0; // Mostrar salida de la BD
    currentSalida = product.salida || 0; // Almacenar salida actual
    if (product.imagen) {
        imagePreview.src = `data:image/jpeg;base64,${product.imagen}`;
        imagePreview.classList.remove('oculto');
    }
    formTitle.textContent = 'Editar Producto';
    submitBtn.textContent = 'Actualizar';
    cancelBtn.classList.remove('oculto');
    editingProductId = id;
    modalFormBg.classList.remove('oculto');
    showFormBtn.classList.add('oculto');
}

// Resetear formulario
function resetForm() {
    productForm.reset();
    document.getElementById('salida').value = 0; // Forzar salida a 0 para nuevos productos
    imagePreview.classList.add('oculto');
    imagePreview.src = '';
    formTitle.textContent = 'Añadir Nuevo Producto';
    submitBtn.textContent = 'Guardar';
    cancelBtn.classList.add('oculto');
    editingProductId = null;
    currentSalida = 0; // Reiniciar salida
    modalFormBg.classList.add('oculto');
    showFormBtn.classList.remove('oculto');
}

// Mostrar o ocultar modal de perfil solo si hay sesión
userProfileProductos.onclick = function () {
    if (usuarioAutenticado) {
        profileModalProductos.style.display = profileModalProductos.style.display === 'block' ? 'none' : 'block';
    }
};

// Verificar autenticación y mostrar nombre
function verificarAutenticacionProductos() {
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const usuarioApellido = localStorage.getItem('usuarioApellido');
    if (usuarioNombre && usuarioApellido) {
        usuarioAutenticado = true;
        userProfileProductos.innerHTML = `
            <div class="profile-info">
                <img src="../img/img_home/avatar.png" alt="" class="avatar_img">
                <span class="user-name">${usuarioNombre} ${usuarioApellido}</span>
            </div>
        `;
        profileUserNameProductos.textContent = `${usuarioNombre} ${usuarioApellido}`;
        btnCerrarSesionModalProductos.style.display = 'block';
        profileModalProductos.style.display = 'none';
    } else {
        usuarioAutenticado = false;
        userProfileProductos.innerHTML = `
            <ul class="users">
                <li><img src="../img/img_home/avatar.png" alt="" class="avatar_img"></li>
                <li class="iniciar_session"><a href="../HTML/index_login.html">Iniciar sesión</a></li>
            </ul>
        `;
        profileUserNameProductos.textContent = 'Iniciar sesión';
        btnCerrarSesionModalProductos.style.display = 'none';
        profileModalProductos.style.display = 'none';
    }
}

