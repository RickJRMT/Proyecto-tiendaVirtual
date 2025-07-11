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
const searchInput = document.querySelector('.buscar_input');
const searchButton = document.querySelector('.buscador_boton');

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

// Crear contenedor para el desplegable de búsqueda
const searchDropdown = document.createElement('div');
searchDropdown.className = 'search-dropdown';
document.querySelector('.buscar_container').appendChild(searchDropdown);

// Formatear precios al formato colombiano ($12.345.678)
function formatearPrecio(valor) {
    console.log('Formateando precio, entrada:', valor, 'tipo:', typeof valor);
    
    // Manejar valores no válidos
    if (valor == null || isNaN(parseFloat(valor))) {
        console.warn('Valor no válido para formatear:', valor);
        return '$0';
    }

    // Convertir a número y redondear a entero
    const numero = Math.round(parseFloat(valor));
    if (isNaN(numero)) {
        console.warn('No se pudo convertir a número:', valor);
        return '$0';
    }

    // Formatear parte entera con puntos cada tres dígitos
    let enteraFormateada = '';
    const entera = numero.toString();
    for (let i = entera.length - 1, count = 0; i >= 0; i--) {
        enteraFormateada = entera[i] + enteraFormateada;
        count++;
        if (count % 3 === 0 && i > 0) {
            enteraFormateada = '.' + enteraFormateada;
        }
    }

    // Combinar con el símbolo de peso
    const resultado = `$${enteraFormateada}`;
    console.log('Precio formateado:', resultado);
    return resultado;
}

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
        hideSearchDropdown(); // Ocultar desplegable de búsqueda
    });

    const filterButtons = document.querySelectorAll('.bt2');
    const barraBuscadora = document.querySelector('.barra_buscadora');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filtrarProductos(filter, barraBuscadora.value);
        });
    });

    barraBuscadora.addEventListener('input', () => {
        const filter = document.querySelector('.bt2.active')?.getAttribute('data-filter') || 'precio';
        filtrarProductos(filter, barraBuscadora.value);
    });

    // Actualizar contador del carrito desde localStorage al cargar
    if (cartCountElement) {
        cartCountElement.textContent = totalCartCount;
        cartCountElement.classList.toggle('hidden', totalCartCount === 0);
    }

    // Manejar búsqueda en tiempo real para el desplegable
    searchInput.addEventListener('input', async () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length > 0) {
            await cargarProductosDesplegable(searchTerm);
        } else {
            hideSearchDropdown();
        }
    });

    // Redirigir al catálogo al hacer clic en el botón de búsqueda
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        window.location.href = `../HTML/index_catalogo.html?search=${encodeURIComponent(searchTerm)}`;
    });

    // Ocultar desplegable al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            hideSearchDropdown();
        }
    });

    // Verificar que carritoManager esté definido
    if (typeof carritoManager === 'undefined') {
        console.error('carritoManager no está definido. Verifica que carrito_manager.js se cargue correctamente.');
    } else {
        console.log('carritoManager está definido:', carritoManager);
    }
});

// Funciones para manejar el modal de perfil
function toggleProfileModal() {
    profileModal.style.display = profileModal.style.display === 'block' ? 'none' : 'block';
    hideSearchDropdown(); // Ocultar desplegable de búsqueda al abrir modal de perfil
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
                    window.location.href = '../HTML/index_actualizarUser.html';
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
                    window.location.href = '../HTML/index_actualizarUser.html';
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

// Cargar productos desde la API (para destacados)
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
            productos.forEach(p => {
                console.log(`Producto: ${p.nombre}, Precio: ${p.precio_venta}, Imagen disponible: ${!!p.imagen}`);
            });
            mostrarProductos(productos);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        contenedorProductos.innerHTML = '<p>Error al cargar los productos. Verifica la conexión con la API.</p>';
        showNotification('Error al cargar los productos');
    }
}

// Cargar productos para el desplegable de búsqueda
async function cargarProductosDesplegable(searchTerm) {
    try {
        console.log('Cargando productos para desplegable con búsqueda:', searchTerm);
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const allProductos = await response.json();
        console.log('Productos obtenidos para desplegable:', allProductos);
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
        console.log('Mostrando producto en desplegable:', producto.nombre, 'Precio:', producto.precio_venta);
        const item = document.createElement('div');
        item.className = 'search-dropdown-item';
        item.innerHTML = `
            ${producto.imagen 
                ? `<img src="data:image/jpeg;base64,${producto.imagen}" alt="${producto.nombre}">`
                : `<div class="no-image">Sin imagen</div>`}
            <div class="item-info">
                <div class="item-name">${producto.nombre}</div>
                <div class="item-price">${formatearPrecio(producto.precio_venta)}</div>
            </div>
        `;
        item.addEventListener('click', () => {
            window.location.href = `../HTML/index_catalogo.html?search=${encodeURIComponent(producto.nombre)}`;
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

// Mostrar productos en el contenedor usando la plantilla
async function mostrarProductos(productosMostrar) {
    contenedorProductos.innerHTML = '';

    for (const producto of productosMostrar) {
        if (producto.saldo === 0) continue;

        console.log('Mostrando producto:', producto.nombre, 'Precio:', producto.precio_venta);
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
        precio.textContent = formatearPrecio(producto.precio_venta);
        addButton.setAttribute('data-id', producto.id_producto);
        addButton.setAttribute('data-name', producto.nombre);
        addButton.setAttribute('data-price', producto.precio_venta);

        // Cargar la imagen del producto
        img.src = producto.imagen ? `data:image/jpeg;base64,${producto.imagen}` : '../img/no-image.jpg';

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
            console.log('Botón "Añadir al carrito" clicado para producto:', producto.nombre);
            const quantityToAdd = parseInt(quantitySpan.textContent);
            const stockDisponible = await verificarStock(producto.id_producto, quantityToAdd);
            if (!stockDisponible) {
                console.log('Stock insuficiente para:', producto.nombre);
                showStockMessage('No hay suficiente stock disponible');
                return;
            }

            const productoCarrito = {
                id_producto: producto.id_producto,
                nombre: producto.nombre,
                precio_venta: producto.precio_venta,
                cantidad: quantityToAdd,
                imagen: producto.imagen ? `data:image/jpeg;base64,${producto.imagen}` : '../img/no-image.jpg'
            };
            console.log('Producto a añadir al carrito:', productoCarrito);
            if (typeof carritoManager !== 'undefined' && carritoManager.agregarProducto) {
                carritoManager.agregarProducto(productoCarrito);
                totalCartCount += quantityToAdd;
                if (cartCountElement) {
                    cartCountElement.textContent = totalCartCount;
                    cartCountElement.classList.remove('hidden');
                }
                localStorage.setItem('totalCartCount', totalCartCount);
                console.log('Mostrando notificación para:', producto.nombre, quantityToAdd);
                showNotification(`${producto.nombre} ha sido añadido (${quantityToAdd} ${quantityToAdd === 1 ? 'unidad' : 'unidades'})`);
            } else {
                console.error('carritoManager no está definido o no tiene agregarProducto');
                showNotification('Error al añadir el producto al carrito');
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
        console.log('Verificando stock para ID:', idProducto);
        const response = await fetch(`${API_URL}/productos/${idProducto}`, {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        if (!response.ok) {
            console.error(`Error HTTP al verificar stock: ${response.status}`);
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const producto = await response.json();
        console.log('Stock verificado para ID:', idProducto, 'Saldo:', producto.saldo, 'Cantidad solicitada:', cantidad);
        return producto.saldo >= cantidad;
    } catch (error) {
        console.error('Error al verificar stock:', error.message);
        showNotification('Error al verificar el stock del producto');
        return false;
    }
}

// Mostrar mensaje de stock en el modal
function showStockMessage(message) {
    console.log('Mostrando mensaje de stock:', message);
    stockMessage.textContent = message;
    stockModal.classList.add('mostrar');
    setTimeout(() => {
        stockModal.classList.remove('mostrar');
    }, 3000);
}

// Mostrar notificaciones
function showNotification(message) {
    console.log('Creando notificación:', message);
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        console.log('Mostrando notificación en el DOM:', message);
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        console.log('Ocultando notificación:', message);
        notification.classList.remove('show');
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
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