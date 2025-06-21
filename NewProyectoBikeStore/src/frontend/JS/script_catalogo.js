// ==============================================================
// Constantes y Variables Globales
// ==============================================================

// URL base de la API
const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const userProfileContainer = document.querySelector('.users');
const menuDesplegable = document.querySelector('.cont_menu ul');
const contenedorProductos = document.querySelector('.product_content');
const searchInput = document.querySelector('.buscar_input');
const filterSelect = document.querySelector('#filtrado');
const cartCountElement = document.getElementById('contador_carrito');
const notificationContainer = document.getElementById('notificacion');

let productos = [];
let totalCartCount = 0;

// ==============================================================
// Funciones de Utilidad
// ==============================================================

// Mostrar notificaciones en pantalla
function showNotification(message) {
    notificationContainer.textContent = message;
    notificationContainer.classList.remove('hidden');
    notificationContainer.classList.add('visible');

    setTimeout(() => {
        notificationContainer.classList.remove('visible');
        notificationContainer.classList.add('hidden');
    }, 3000);
}

// Actualizar el contador del carrito
function updateCartCount(count) {
    totalCartCount = count;
    cartCountElement.textContent = totalCartCount;
    cartCountElement.classList.toggle('hidden', totalCartCount === 0);
}

// Verificar disponibilidad de stock
async function verificarStock(idProducto, cantidad) {
    try {
        const response = await fetch(`${API_URL}/stocks/${idProducto}`);
        if (!response.ok) throw new Error('Error al verificar stock');
        const stock = await response.json();
        return stock.stock >= cantidad;
    } catch (error) {
        console.error('Error al verificar stock:', error);
        return false;
    }
}

// Guardar producto en el carrito
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
}

// Mostrar productos creando elementos del DOM
function mostrarProductos(productosMostrar) {
    contenedorProductos.innerHTML = ''; // Limpiamos el contenedor

    if (!productosMostrar || productosMostrar.length === 0) {
        contenedorProductos.innerHTML = '<p>No se encontraron productos disponibles.</p>';
        return;
    }

    productosMostrar.forEach(producto => {
        // Crear el contenedor del producto
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        // Imagen del producto
        const img = document.createElement('img');
        img.src = producto.imagen ? `data:image/jpeg;base64,${producto.imagen}` : 'https://via.placeholder.com/120x80?text=Sin+imagen';
        img.alt = producto.nombre;
        img.classList.add('product-img');

        // Contenedor de texto
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

        // Contenedor de botones de cantidad
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

        // Botón de añadir al carrito
        const addButton = document.createElement('button');
        addButton.classList.add('agregar_carrito');
        addButton.textContent = 'Añadir al carrito';
        addButton.setAttribute('data-id', producto.id_producto);
        addButton.setAttribute('data-name', producto.nombre);
        addButton.setAttribute('data-price', producto.precio_venta);

        // Añadir todos los elementos al contenedor del producto
        productDiv.appendChild(img);
        productDiv.appendChild(productTxt);
        productDiv.appendChild(cantidadControl);
        productDiv.appendChild(addButton);

        // Añadir el producto al contenedor principal
        contenedorProductos.appendChild(productDiv);

        // Gestionar la cantidad
        let currentQuantity = 1;

        minusButton.addEventListener('click', () => {
            console.log(`Disminuyendo cantidad para ${producto.nombre}`); // Depuración
            if (currentQuantity > 1) {
                currentQuantity--;
                quantityInput.value = currentQuantity;
            }
        });

        plusButton.addEventListener('click', () => {
            console.log(`Aumentando cantidad para ${producto.nombre}`); // Depuración
            currentQuantity++;
            quantityInput.value = currentQuantity;
        });

        // Añadir al carrito
        addButton.addEventListener('click', async () => {
            console.log(`Añadiendo ${producto.nombre} al carrito con cantidad ${currentQuantity}`); // Depuración
            const quantityToAdd = parseInt(quantityInput.value);
            const stockDisponible = await verificarStock(producto.id_producto, quantityToAdd);
            if (!stockDisponible) {
                showNotification('No hay suficiente stock disponible');
                return;
            }
            totalCartCount += quantityToAdd;
            updateCartCount(totalCartCount);
            showNotification(`Se añadieron ${quantityToAdd} ${producto.nombre}(s) al carrito`);

            guardarProductoEnCarrito({
                id_producto: producto.id_producto,
                nombre: producto.nombre,
                precio_venta: producto.precio_venta,
                cantidad: quantityToAdd
            });

            currentQuantity = 1;
            quantityInput.value = currentQuantity;
        });
    });
}

// Filtrar productos según búsqueda y selección
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

// Verificar autenticación del usuario
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
                        <span class="user-name">${usuarioNombre} ${usuarioApellido}</span>
                        <button id="btnCerrarSesion" class="logout-btn">Cerrar sesión</button>
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
                document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
                document.getElementById('btnCerrarSesionMenu').addEventListener('click', cerrarSesion);
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
                <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                <li><a href="#">Contáctanos</a></li>
            `;
            showNotification('Error al verificar la sesión. Por favor, inicia sesión nuevamente.');
        });
}

// Cerrar sesión del usuario
function cerrarSesion(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '../HTML/index_login.html?redirect=catalogo';
}

// Cargar productos desde la API
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

// ==============================================================
// Gestión de Eventos
// ==============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación del usuario
    verificarAutenticacion();

    // Cargar productos
    cargarProductos();

    // Eventos de filtrado
    searchInput.addEventListener('input', filtrarProductos);
    filterSelect.addEventListener('change', filtrarProductos);

    // Control del menú hamburguesa
    document.querySelector('#btn_menu').addEventListener('change', function () {
        document.body.classList.toggle('menu_active', this.checked);
    });

    // Efecto de opacidad en el header al hacer scroll
    const header = document.querySelector('header');
    const alturaHeader = parseFloat(getComputedStyle(header).height);
    window.addEventListener('scroll', () => {
        let opa = window.scrollY === 0 ? '80%' : window.scrollY >= alturaHeader && window.scrollY < 2 * alturaHeader ? '100%' : '80%';
        header.style.setProperty('opacity', opa);
    });
});