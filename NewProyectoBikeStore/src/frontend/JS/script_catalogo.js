const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const userProfileContainer = document.querySelector('.users');
const menuDesplegable = document.querySelector('#menuDesplegable');
const contenedorProductos = document.querySelector('.product_content');
const searchInput = document.querySelector('.buscar_input');
const searchButton = document.querySelector('.buscador_boton');
const filterSelect = document.querySelector('#filtrado');
const cartCountElement = document.getElementById('contador_carrito');
const notificationContainer = document.getElementById('notificacion');
const profileModal = document.querySelector('#profileModal');
const profileUserName = document.querySelector('.profile-user-name');
const templateProducto = document.querySelector('#templateProducto');

// Crear contenedor para el desplegable de búsqueda
const searchDropdown = document.createElement('div');
searchDropdown.className = 'search-dropdown';
document.querySelector('.buscar_container').appendChild(searchDropdown);

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

// Cargar productos para el desplegable de búsqueda
async function cargarProductosDesplegable(searchTerm) {
    try {
        console.log('Cargando productos para desplegable con búsqueda:', searchTerm);
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const allProductos = await response.json();
        const productosFiltrados = allProductos.filter(producto =>
            producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        mostrarProductosDesplegable(productosFiltrados);
    } catch (error) {
        console.error('Error al cargar productos para desplegable:', error);
        showNotification('Error al cargar los productos para búsqueda');
        hideSearchDropdown();
    }
}

// Mostrar productos en el desplegable
function mostrarProductosDesplegable(productosFiltrados) {
    searchDropdown.innerHTML = '';
    if (productosFiltrados.length === 0) {
        hideSearchDropdown();
        return;
    }

    productosFiltrados.forEach(producto => {
        const item = document.createElement('div');
        item.className = 'search-dropdown-item';
        item.innerHTML = `
            ${producto.imagen 
                ? `<img src="data:image/jpeg;base64,${producto.imagen}" alt="${producto.nombre}">`
                : `<div class="no-image">Sin imagen</div>`}
            <div class="item-info">
                <div class="item-name">${producto.nombre}</div>
                <div class="item-price">$${producto.precio_venta.toLocaleString('es-CO')}</div>
            </div>
        `;
        item.addEventListener('click', () => {
            searchInput.value = producto.nombre;
            filtrarProductos();
            hideSearchDropdown();
        });
        searchDropdown.appendChild(item);
    });

    searchDropdown.classList.add('show');
}

// Ocultar desplegable de búsqueda
function hideSearchDropdown() {
    searchDropdown.classList.remove('show');
    searchDropdown.innerHTML = '';
}

// Mostrar productos en el contenedor
function mostrarProductos(productosMostrar) {
    contenedorProductos.innerHTML = '';

    if (!productosMostrar || productosMostrar.length === 0) {
        contenedorProductos.innerHTML = '<p>No se encontraron productos disponibles.</p>';
        return;
    }

    productosMostrar.forEach(producto => {
        if (producto.saldo === 0) return;

        const clone = templateProducto.content.cloneNode(true);
        const productContainer = clone.querySelector('.product');
        const img = clone.querySelector('.product-img');
        const nombre = clone.querySelector('.product-nombre');
        const precio = clone.querySelector('.precio');
        const addButton = clone.querySelector('.agregar_carrito');
        const minusButton = clone.querySelector('.disminuir-btn');
        const plusButton = clone.querySelector('.aumentar-btn');
        const quantityInput = clone.querySelector('.mostrar-cantidad');

        let currentQuantity = 1;

        nombre.textContent = producto.nombre;
        precio.textContent = `$${producto.precio_venta.toLocaleString('es-CO')}`;
        img.src = producto.imagen ? `data:image/jpeg;base64,${producto.imagen}` : 'https://via.placeholder.com/120x80?text=Sin+imagen';
        img.alt = producto.nombre;
        addButton.setAttribute('data-id', producto.id_producto);
        addButton.setAttribute('data-name', producto.nombre);
        addButton.setAttribute('data-price', producto.precio_venta);

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

        contenedorProductos.appendChild(clone);
    });
}

// Filtrar y ordenar productos
function filtrarProductos() {
    let productosFiltrados = [...productos];
    const searchTerm = searchInput.value.trim().toLowerCase();
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
        profileUserName.textContent = 'Iniciar sesión';
        document.querySelector('.logout-btn').style.display = 'none';
        document.getElementById('btnActualizarDatos').style.display = 'none';
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
                profileUserName.textContent = `${usuarioNombre} ${usuarioApellido}`;
                document.querySelector('.logout-btn').style.display = 'block';
                document.getElementById('btnActualizarDatos').style.display = 'block';
                menuDesplegable.innerHTML = `
                    <li><span class="user-name">Bienvenido, ${usuarioNombre} ${usuarioApellido}</span></li>
                    <li><button id="btnCerrarSesionMenu" class="logout-btn">Cerrar sesión</button></li>
                    <li><button id="btnActualizarDatosMenu" class="update-btn">Actualizar datos</button></li>
                    <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                    <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                    <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                    <li><a href="#">Contáctanos</a></li>
                `;
                document.getElementById('btnCerrarSesionMenu').addEventListener('click', cerrarSesion);
                document.getElementById('btnActualizarDatosMenu').addEventListener('click', () => {
                    window.location.href = '../HTML/index_actualizarUser.html';
                });
            } else {
                localStorage.clear();
                window.location.href = '../HTML/index_login.html?redirect=catalogo';
            }
        })
        .catch(error => {
            console.error('Error al verificar sesión:', error);
            userProfileContainer.innerHTML = `
                <li><img src="../img/img_home/avatar.png" alt="Avatar" class="avatar_img"></li>
                <li class="iniciar_session"><a href="../HTML/index_login.html?redirect=catalogo">Iniciar sesión</a></li>
            `;
            profileUserName.textContent = 'Iniciar sesión';
            document.querySelector('.logout-btn').style.display = 'none';
            document.getElementById('btnActualizarDatos').style.display = 'none';
            menuDesplegable.innerHTML = `
                <li><a href="../HTML/index_login.html?redirect=catalogo">Iniciar sesión</a></li>
                <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                <li><a href="#">Contáctanos</a></li>
            `;
        });
}

// Cerrar sesión
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
        filtrarProductos();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        contenedorProductos.innerHTML = '<p>Error al cargar los productos.</p>';
        showNotification('Error al cargar los productos');
    }
}

// Manejar eventos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarProductos();

    // Obtener parámetro de búsqueda de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search') || '';
    if (searchTerm) {
        searchInput.value = decodeURIComponent(searchTerm);
        filtrarProductos();
    }

    // Actualizar contador del carrito
    updateCartCount(totalCartCount);

    // Evento para el filtro por precio
    filterSelect.addEventListener('change', filtrarProductos);

    // Evento para búsqueda en tiempo real (desplegable)
    searchInput.addEventListener('input', async () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length > 0) {
            await cargarProductosDesplegable(searchTerm);
        } else {
            hideSearchDropdown();
            filtrarProductos();
        }
    });

    // Evento para el botón de búsqueda
    searchButton.addEventListener('click', () => {
        filtrarProductos();
        hideSearchDropdown();
    });

    // Ocultar desplegable al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            hideSearchDropdown();
        }
    });

    // Ocultar desplegable al abrir el menú hamburguesa
    document.querySelector('#btn_menu').addEventListener('change', function () {
        hideSearchDropdown();
        profileModal.style.display = 'none';
    });

    // Manejar modal de perfil
    userProfileContainer.addEventListener('click', () => {
        profileModal.style.display = profileModal.style.display === 'block' ? 'none' : 'block';
        hideSearchDropdown();
    });

    document.querySelector('.profile-close').addEventListener('click', () => {
        profileModal.style.display = 'none';
    });

    document.querySelector('.logout-btn').addEventListener('click', cerrarSesion);
});

// Control del carrusel
document.addEventListener('DOMContentLoaded', () => {
    const sliderUl = document.querySelector('.slider_frame ul');
    let currentIndex = 0;
    const totalSlides = 4;

    function moveToSlide(index) {
        sliderUl.style.transform = `translateX(-${index * 25}%)`;
    }

    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        moveToSlide(currentIndex);
    }, 5000);
});