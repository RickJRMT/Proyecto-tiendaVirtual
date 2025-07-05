// Constantes y Variables Globales
const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const userProfileContainer = document.querySelector('.users');
const menuDesplegable = document.querySelector('#menuDesplegable');
const contenedorProductos = document.querySelector('.product_content');
const searchInput = document.querySelector('.buscar_input');
const filterSelect = document.querySelector('#filtrado');
const cartCountElement = document.getElementById('contador_carrito');
const notificationContainer = document.getElementById('notificacion');
const profileModal = document.querySelector('#profileModal');

let productos = [];
let totalCartCount = parseInt(localStorage.getItem('totalCartCount')) || 0;

// Funciones de Utilidad
function showNotification(message) {
    notificationContainer.textContent = message;
    notificationContainer.classList.remove('hidden');
    notificationContainer.classList.add('visible');

    setTimeout(() => {
        notificationContainer.classList.remove('visible');
        notificationContainer.classList.add('hidden');
    }, 3000);
}

function updateCartCount(count) {
    totalCartCount = count;
    if (cartCountElement) {
        cartCountElement.textContent = totalCartCount;
        cartCountElement.classList.toggle('hidden', totalCartCount === 0);
    }
    localStorage.setItem('totalCartCount', totalCartCount);
}

async function verificarStock(idProducto, cantidad) {
    try {
        const response = await fetch(`${API_URL}/productos/${idProducto}`);
        if (!response.ok) throw new Error('Error al verificar stock');
        const producto = await response.json();
        return producto.saldo >= cantidad;
    } catch (error) {
        console.error('Error al verificar stock:', error);
        return false;
    }
}

function guardarProductoEnCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoExistente = carrito.find(item => item.id_producto === producto.id_producto);

    if (productoExistente) {
        productoExistente.cantidad += producto.cantidad;
    } else {
        carrito.push(producto);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    updateCartCount(totalCartCount + producto.cantidad);
    showNotification(`Se añadieron ${producto.cantidad} ${producto.nombre}(s) al carrito`);
}

function mostrarProductos(productosMostrar) {
    contenedorProductos.innerHTML = '';

    if (!productosMostrar || productosMostrar.length === 0) {
        contenedorProductos.innerHTML = '<p>No se encontraron productos disponibles.</p>';
        return;
    }

    productosMostrar.forEach(producto => {

        if (producto.saldo === 0) return;

        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        const img = document.createElement('img');
        img.src = producto.imagen ? `data:image/jpeg;base64,${producto.imagen}` : 'https://via.placeholder.com/120x80?text=Sin+imagen';
        img.alt = producto.nombre;
        img.classList.add('product-img');

        const productTxt = document.createElement('div');
        productTxt.classList.add('product_txt');

        const nombre = document.createElement('h3');
        nombre.classList.add('product-nombre');
        nombre.textContent = producto.nombre;

        const precio = document.createElement('p');
        precio.classList.add('precio');
        precio.textContent = `$${producto.precio_venta.toLocaleString('es-CO')}`;

        productTxt.appendChild(nombre);
        productTxt.appendChild(precio);

        const cantidadControl = document.createElement('div');
        cantidadControl.classList.add('cantidad-control-btn');

        const minusButton = document.createElement('button');
        minusButton.classList.add('cantidad-btn', 'disminuir-btn');
        minusButton.textContent = '-';

        const quantityInput = document.createElement('input');
        quantityInput.type = 'text';
        quantityInput.classList.add('mostrar-cantidad');
        quantityInput.value = '1';
        quantityInput.readOnly = true;

        const plusButton = document.createElement('button');
        plusButton.classList.add('cantidad-btn', 'aumentar-btn');
        plusButton.textContent = '+';

        cantidadControl.appendChild(minusButton);
        cantidadControl.appendChild(quantityInput);
        cantidadControl.appendChild(plusButton);

        const addButton = document.createElement('button');
        addButton.classList.add('agregar_carrito');
        addButton.textContent = 'Añadir al carrito';
        addButton.setAttribute('data-id', producto.id_producto);
        addButton.setAttribute('data-name', producto.nombre);
        addButton.setAttribute('data-price', producto.precio_venta);

        productDiv.appendChild(img);
        productDiv.appendChild(productTxt);
        productDiv.appendChild(cantidadControl);
        productDiv.appendChild(addButton);

        contenedorProductos.appendChild(productDiv);

        let currentQuantity = 1;

        minusButton.addEventListener('click', () => {
            if (currentQuantity > 1) {
                currentQuantity--;
                quantityInput.value = currentQuantity;
            }
        });

        plusButton.addEventListener('click', () => {
            currentQuantity++;
            quantityInput.value = currentQuantity;
        });

        addButton.addEventListener('click', async () => {
            const quantityToAdd = parseInt(quantityInput.value);
            const stockDisponible = await verificarStock(producto.id_producto, quantityToAdd);
            if (!stockDisponible) {
                showNotification('No hay suficiente stock disponible');
                return;
            }

            const productoCarrito = {
                id_producto: producto.id_producto,
                nombre: producto.nombre,
                precio_venta: producto.precio_venta,
                cantidad: quantityToAdd,
                imagen: img.src
            };
            guardarProductoEnCarrito(productoCarrito);

            currentQuantity = 1;
            quantityInput.value = currentQuantity;
        });
    });
}

function filtrarProductos() {
    let productosFiltrados = [...productos];
    const searchTerm = searchInput.value.toLowerCase();
    const filter = filterSelect.value || 'menor';

    if (searchTerm) {
        productosFiltrados = productosFiltrados.filter(producto =>
            producto.nombre.toLowerCase().includes(searchTerm) ||
            producto.descripcion?.toLowerCase().includes(searchTerm)
        );
    }

    if (filter === 'menor') {
        productosFiltrados.sort((a, b) => a.precio_venta - b.precio_venta);
    } else if (filter === 'mayor') {
        productosFiltrados.sort((a, b) => b.precio_venta - a.precio_venta);
    }

    mostrarProductos(productosFiltrados);
}

function verificarAutenticacion() {
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const usuarioApellido = localStorage.getItem('usuarioApellido');

    if (!usuarioId) {
        userProfileContainer.innerHTML = `
            <li><img src="../img/img_home/avatar.png" alt="Avatar" class="avatar_img"></li>
            <li class="iniciar_session"><a href="../HTML/index_login.html?redirect=catalogo">Iniciar sesión</a></li>
        `;
        menuDesplegable.innerHTML = `
            <li><a href="../HTML/index_login.html?redirect=catalogo">Iniciar sesión</a></li>
            <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
            <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
            <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
            <li><a href="#">Contáctanos</a></li>
        `;
        return;
    }

    fetch(`${API_URL}/auth/verificar/${usuarioId}`)
        .then(response => {
            if (!response.ok) throw new Error('Sesión inválida');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                userProfileContainer.innerHTML = `
                    <div class="profile-info">
                        <img src="../img/img_home/avatar.png" alt="Avatar" class="avatar_img">
                        <span class="user-name">${usuarioNombre} ${usuarioApellido}</span>
                    </div>
                `;
                menuDesplegable.innerHTML = `
                    <li><span class="user-name">Bienvenido, ${usuarioNombre} ${usuarioApellido}</span></li>
                    <li><button id="btnCerrarSesionMenu" class="logout-btn">Cerrar sesión</button></li>
                    <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                    <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                    <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                    <li><a href="#">Contáctanos</a></li>
                `;
                document.querySelector('.profile-user-name').textContent = `${usuarioNombre} ${usuarioApellido}`;
                const profileInfo = document.querySelector('.profile-info');
                const logoutBtnModal = document.querySelector('.profile-modal .logout-btn');
                profileInfo.addEventListener('click', () => {
                    profileModal.style.display = 'block';
                });
                document.querySelector('.profile-close').addEventListener('click', () => {
                    profileModal.style.display = 'none';
                });
                profileModal.addEventListener('click', (e) => {
                    if (e.target === profileModal) {
                        profileModal.style.display = 'none';
                    }
                });
                document.getElementById('btnCerrarSesionMenu').addEventListener('click', cerrarSesion);
                logoutBtnModal.addEventListener('click', cerrarSesion);
            } else {
                localStorage.clear();
                userProfileContainer.innerHTML = `
                    <li><img src="../img/img_home/avatar.png" alt="Avatar" class="avatar_img"></li>
                    <li class="iniciar_session"><a href="../HTML/index_login.html?redirect=catalogo">Iniciar sesión</a></li>
                `;
                menuDesplegable.innerHTML = `
                    <li><a href="../HTML/index_login.html?redirect=catalogo">Iniciar sesión</a></li>
                    <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                    <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                    <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                    <li><a href="#">Contáctanos</a></li>
                `;
                showNotification('Sesión inválida. Por favor, inicia sesión nuevamente.');
            }
        })
        .catch(error => {
            console.error('Error al verificar sesión:', error);
            localStorage.clear();
            userProfileContainer.innerHTML = `
                <li><img src="../img/img_home/avatar.png" alt="Avatar" class="avatar_img"></li>
                <li class="iniciar_session"><a href="../HTML/index_login.html?redirect=catalogo">Iniciar sesión</a></li>
            `;
            menuDesplegable.innerHTML = `
                <li><a href="../HTML/index_login.html?redirect=catalogo">Iniciar sesión</a></li>
                <li><a href="../HTML/index_home.html">Home</a></li>
                <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                <li><a href="#">Contáctanos</a></li>
            `;
            showNotification('Error al verificar la sesión. Por favor, inicia sesión nuevamente.');
        });
}

function cerrarSesion(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '../HTML/index_login.html?redirect=catalogo';
}

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        productos = await response.json();
        if (productos.length === 0) {
            showNotification('No se encontraron productos disponibles.');
        } else {
            mostrarProductos(productos);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        showNotification('Error al cargar los productos. Verifica la conexión con la API.');
    }
}

// Gestión de Eventos
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarProductos();

    searchInput.addEventListener('input', filtrarProductos);
    filterSelect.addEventListener('change', filtrarProductos);

    document.querySelector('#btn_menu').addEventListener('change', function () {
        document.body.classList.toggle('menu_active', this.checked);
    });

    const header = document.querySelector('header');
    const alturaHeader = parseFloat(getComputedStyle(header).height);
    window.addEventListener('scroll', () => {
        let opa = window.scrollY === 0 ? '80%' : window.scrollY >= alturaHeader && window.scrollY < 2 * alturaHeader ? '100%' : '80%';
        header.style.setProperty('opacity', opa);
    });
});