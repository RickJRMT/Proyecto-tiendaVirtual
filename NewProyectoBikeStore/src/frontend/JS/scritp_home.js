// URL base de la API
const API_URL = 'http://localhost:3000/api';

// Arreglo para almacenar los productos
let productos = [];

// Elementos del DOM
const userProfileContainer = document.querySelector('#userProfile');
const contenedorProductos = document.querySelector('#contenedorProductos');
const templateProducto = document.querySelector('#templateProducto');
const cartCountElement = document.querySelector('.cart-count');
const menuDesplegable = document.querySelector('#menuDesplegable');
const profileModal = document.querySelector('#profileModal');
const profileUserName = document.querySelector('#profileUserName');
const profileAvatar = document.querySelector('.profile-avatar');

// Contador total inicial (sincronizado con localStorage)
let totalCartCount = parseInt(localStorage.getItem('totalCartCount')) || 0;

// Crear contenedor para notificaciones
const notificationContainer = document.createElement('div');
notificationContainer.className = 'notification-container';
document.body.appendChild(notificationContainer);

// Crear modal para mensajes de stock
const stockModal = document.createElement('div');
stockModal.className = 'stock-modal';
stockModal.innerHTML = `<p id="stock-message"></p>`;
document.body.appendChild(stockModal);

const stockMessage = document.getElementById('stock-message');

// =========================
// EVENTOS PRINCIPALES
// =========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando verificarAutenticacion y cargarProductos');
    verificarAutenticacion();
    cargarProductos();

    const header = document.querySelector('header');
    const alturaHeader = parseFloat(getComputedStyle(header).height);
    window.addEventListener('scroll', () => {
        let opa = window.scrollY === 0 ? '80%' : window.scrollY >= alturaHeader && window.scrollY < 2 * alturaHeader ? '100%' : '80%';
        header.style.setProperty('opacity', opa);
    });

    document.querySelector('#btn_menu').addEventListener('change', function () {
        document.body.classList.toggle('menu_active', this.checked);
        const containerMenu = document.querySelector('.container_menu_desple');
        containerMenu.classList.toggle('active', this.checked);
        closeProfileModal(); // Cerrar modal de perfil al abrir/cerrar menú hamburguesa
    });

    const filterButtons = document.querySelectorAll('.bt2');
    const searchInput = document.querySelector('.barra_buscadora');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filtrarProductos(filter, searchInput.value);
        });
    });

    searchInput.addEventListener('input', () => {
        const filter = document.querySelector('.bt2.active')?.getAttribute('data-filter') || 'precio';
        filtrarProductos(filter, searchInput.value);
    });

    // Actualizar contador del carrito desde localStorage al cargar
    if (cartCountElement) {
        cartCountElement.textContent = totalCartCount;
        cartCountElement.classList.toggle('hidden', totalCartCount === 0);
    }
});

// Funciones para manejar el modal de perfil
function toggleProfileModal() {
    profileModal.style.display = profileModal.style.display === 'block' ? 'none' : 'block';
}

function closeProfileModal() {
    profileModal.style.display = 'none';
}

// Verificar autenticación del usuario
function verificarAutenticacion() {
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const usuarioApellido = localStorage.getItem('usuarioApellido');
    const usuarioRol = localStorage.getItem('usuarioRol');

    console.log('Verificando autenticación - usuarioId:', usuarioId, 'usuarioNombre:', usuarioNombre);

    if (!usuarioId) {
        console.log('No hay usuarioId, mostrando "Iniciar sesión"');
        userProfileContainer.innerHTML = `
            <ul class="users">
                <li><img src="../img/img_home/avatar.png" alt="" class="avatar_img"></li>
                <li class="iniciar_session"><a href="../HTML/index_login.html">Iniciar sesión</a></li>
            </ul>
        `;
        profileUserName.textContent = 'Iniciar sesión';
        document.getElementById('btnCerrarSesionModal').style.display = 'none';
        document.getElementById('btnActualizarDatos').style.display = 'none';
        menuDesplegable.innerHTML = `
            <li><a href="../HTML/index_login.html">Iniciar sesión</a></li>
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
            console.log('Respuesta de verificación:', data);
            if (data.success) {
                if (data.rol === 'admin') {
                    console.log('Usuario es admin, redirigiendo a index_admin.html');
                    window.location.href = '../HTML/index_admin.html';
                    return;
                }
                console.log('Usuario autenticado, actualizando DOM con nombre:', usuarioNombre, usuarioApellido);
                userProfileContainer.innerHTML = `
                    <div class="profile-info">
                        <img src="../img/img_home/avatar.png" alt="" class="avatar_img">
                        <span class="user-name">${usuarioNombre} ${usuarioApellido}</span>
                    </div>
                `;
                profileUserName.textContent = `${usuarioNombre} ${usuarioApellido}`;
                document.getElementById('btnCerrarSesionModal').style.display = 'block';
                document.getElementById('btnActualizarDatos').style.display = 'block';
                document.getElementById('btnCerrarSesionModal').addEventListener('click', cerrarSesion);
                document.getElementById('btnActualizarDatos').addEventListener('click', () => {
                    console.log('Funcionalidad de actualizar datos no implementada aún');
                    showNotification('Funcionalidad de actualizar datos no disponible');
                });

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
                    console.log('Funcionalidad de actualizar datos no implementada aún');
                    showNotification('Funcionalidad de actualizar datos no disponible');
                });
            } else {
                console.log('Usuario no válido según el servidor, mostrando "Iniciar sesión"');
                localStorage.clear();
                window.location.href = '../HTML/index_login.html';
            }
        })
        .catch(error => {
            console.error('Error al verificar sesión:', error);
            userProfileContainer.innerHTML = `
                <ul class="users">
                    <li><img src="../img/img_home/avatar.png" alt="" class="avatar_img"></li>
                    <li class="iniciar_session"><a href="../HTML/index_login.html">Iniciar sesión</a></li>
                </ul>
            `;
            profileUserName.textContent = 'Iniciar sesión';
            document.getElementById('btnCerrarSesionModal').style.display = 'none';
            document.getElementById('btnActualizarDatos').style.display = 'none';
            menuDesplegable.innerHTML = `
                <li><a href="../HTML/index_login.html">Iniciar sesión</a></li>
                <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                <li><a href="#">Contáctanos</a></li>
            `;
        });
}

// Cerrar sesión del usuario
function cerrarSesion(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '../HTML/index_login.html';
}

// Cargar productos desde la API
async function cargarProductos() {
    try {
        console.log('Intentando cargar productos desde:', `${API_URL}/productos?destacado=true`);
        const response = await fetch(`${API_URL}/productos?destacado=true`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        productos = await response.json();
        console.log('Productos cargados:', productos);
        if (productos.length === 0) {
            console.log('No hay productos destacados');
            contenedorProductos.innerHTML = '<p>No hay productos destacados disponibles.</p>';
        } else {
            mostrarProductos(productos);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        contenedorProductos.innerHTML = '<p>Error al cargar los productos. Verifica la conexión con la API.</p>';
        showNotification('Error al cargar los productos');
    }
}

// Mostrar productos en el contenedor usando la plantilla
async function mostrarProductos(productosMostrar) {
    contenedorProductos.innerHTML = '';

    for (const producto of productosMostrar) {

        if (producto.saldo === 0)continue;

        const clone = templateProducto.content.cloneNode(true);
        const productContainer = clone.querySelector('.product1_dest');
        const img = clone.querySelector('.product-img');
        const precio = clone.querySelector('.product-precio');
        const nombre = clone.querySelector('.product-nombre');
        const addButton = clone.querySelector('.agregar-carrito');
        const minusButton = clone.querySelector('.quantity_btn.minus');
        const plusButton = clone.querySelector('.quantity_btn.plus');
        const quantitySpan = clone.querySelector('.quantity');

        let currentQuantity = 1;

        nombre.textContent = producto.nombre;
        precio.textContent = `$${producto.precio_venta.toLocaleString('es-CO')}`;
        addButton.setAttribute('data-id', producto.id_producto);
        addButton.setAttribute('data-name', producto.nombre);
        addButton.setAttribute('data-price', producto.precio_venta);

        try {
            const response = await fetch(`${API_URL}/imagenes/obtener/productos/id_producto/${producto.id_producto}`);
            if (!response.ok) throw new Error('Error al obtener la imagen');
            const data = await response.json();
            if (data.imagen) {
                img.src = `data:image/jpeg;base64,${data.imagen}`;
            } else {
                img.src = 'https://via.placeholder.com/120x80?text=Sin+imagen';
            }
        } catch (error) {
            console.error('Error al cargar imagen para producto ID:', producto.id_producto, error);
            img.src = 'https://via.placeholder.com/120x80?text=Sin+imagen';
        }

        minusButton.addEventListener('click', () => {
            if (currentQuantity > 1) {
                currentQuantity--;
                quantitySpan.textContent = currentQuantity;
            }
        });

        plusButton.addEventListener('click', () => {
            currentQuantity++;
            quantitySpan.textContent = currentQuantity;
        });

        addButton.addEventListener('click', async () => {
            const quantityToAdd = parseInt(quantitySpan.textContent);
            const stockDisponible = await verificarStock(producto.id_producto, quantityToAdd);
            if (!stockDisponible) {
                showStockMessage('No hay suficiente stock disponible');
                return;
            }

            const productoCarrito = {
                id_producto: producto.id_producto,
                nombre: producto.nombre,
                precio_venta: producto.precio_venta,
                cantidad: quantityToAdd,
                imagen: img.src
            };
            if (typeof carritoManager !== 'undefined' && carritoManager.agregarProducto) {
                carritoManager.agregarProducto(productoCarrito);
                totalCartCount += quantityToAdd;
                if (cartCountElement) {
                    cartCountElement.textContent = totalCartCount;
                    cartCountElement.classList.remove('hidden');
                }
                localStorage.setItem('totalCartCount', totalCartCount);
                showNotification(`Se añadieron ${quantityToAdd} ${producto.nombre}(s) al carrito`);
            } else {
                console.error('carritoManager no está definido o no tiene agregarProducto');
            }

            currentQuantity = 1;
            quantitySpan.textContent = currentQuantity;
        });

        contenedorProductos.appendChild(clone);
    }
}

// Filtrar y ordenar productos
function filtrarProductos(filter, searchTerm) {
    let productosFiltrados = [...productos];

    if (searchTerm) {
        productosFiltrados = productosFiltrados.filter(producto =>
            producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (filter === 'precio') {
        productosFiltrados.sort((a, b) => a.precio_venta - b.precio_venta);
    }

    mostrarProductos(productosFiltrados);
}

// Verificar stock disponible
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

// Mostrar mensaje de stock en el modal
function showStockMessage(message) {
    stockMessage.textContent = message;
    stockModal.classList.add('mostrar');
    setTimeout(() => {
        stockModal.classList.remove('mostrar');
    }, 3000);
}

// Mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification show';
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 500);
    }, 3000);
}

// Funciones para modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

window.onclick = function (event) {
    const modals = document.getElementsByClassName('modal');
    for (let i = 0; i < modals.length; i++) {
        if (event.target === modals[i]) {
            closeModal(modals[i].id);
        }
    }
    if (event.target === profileModal) {
        closeProfileModal();
    }
};

// Control del carrusel
document.addEventListener('DOMContentLoaded', () => {
    const sliderUl = document.querySelector('.slider_frame ul');
    const prevButton = document.querySelector('.slider-prev');
    const nextButton = document.querySelector('.slider-next');
    let currentIndex = 0;
    const totalSlides = 4;

    if (prevButton && nextButton && sliderUl) {
        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            sliderUl.style.transform = `translateX(-${currentIndex * 25}%)`;
            sliderUl.style.animation = 'none';
        });

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            sliderUl.style.transform = `translateX(-${currentIndex * 25}%)`;
            sliderUl.style.animation = 'none';
        });

        [prevButton, nextButton].forEach(button => {
            button.addEventListener('click', () => {
                setTimeout(() => {
                    sliderUl.style.animation = 'slide 20s infinite alternate ease-in-out';
                }, 5000);
            });
        });
    }
});