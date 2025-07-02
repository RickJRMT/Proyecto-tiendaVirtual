// URL base de la API
const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const userProfileContainer = document.querySelector('.users');
const menuDesplegable = document.querySelector('#menuDesplegable');
const contenedorCarrito = document.getElementById('contenedorCarrito');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const btnComprar = document.getElementById('iniciar-compra');
const confirmacionModal = document.getElementById('confirmacion-modal');
const detalleVentaModal = document.getElementById('detalle-venta-modal');
const notificacion = document.getElementById('notificacion');
const profileModal = document.querySelector('#profileModal');

// Verificar autenticación del usuario
function verificarAutenticacion() {
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const usuarioApellido = localStorage.getItem('usuarioApellido');

    if (!usuarioId) {
        userProfileContainer.innerHTML = `
            <li><img src="../img/img_catalogo/avatar.png" alt="Avatar" class="avatar_img"></li>
            <li class="iniciar_session"><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
        `;
        menuDesplegable.innerHTML = `
            <li><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
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
                        <img src="../img/img_catalogo/avatar.png" alt="Avatar" class="avatar_img">
                        <span class="user-name">${usuarioNombre} ${usuarioApellido}</span>
                    </div>
                `;
                menuDesplegable.innerHTML = `
                    <li><span class="user-name">Bienvenido, ${usuarioNombre} ${usuarioApellido}</span></li>
                    <li><button id="btnCerrarSesionMenu" class="logout-btn">Cerrar sesión</button></li>
                    <li><button id="btnActualizarMenu" class="update-btn">Actualizar datos</button></li>
                    <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                    <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                    <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                    <li><a href="#">Contáctanos</a></li>
                `;
                document.querySelector('.profile-user-name').textContent = `${usuarioNombre} ${usuarioApellido}`;
                const profileInfo = document.querySelector('.profile-info');
                const logoutBtnModal = document.querySelector('.profile-modal .logout-btn');
                const updateBtnModal = document.querySelector('.profile-modal .update-btn');
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
                document.getElementById('btnActualizarMenu').addEventListener('click', actualizarDatos);
                updateBtnModal.addEventListener('click', actualizarDatos);
            } else {
                localStorage.clear();
                userProfileContainer.innerHTML = `
                    <li><img src="../img/img_catalogo/avatar.png" alt="Avatar" class="avatar_img"></li>
                    <li class="iniciar_session"><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
                `;
                menuDesplegable.innerHTML = `
                    <li><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
                    <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                    <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                    <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                    <li><a href="#">Contáctanos</a></li>
                `;
                notificacion.textContent = 'Sesión inválida. Por favor, inicia sesión nuevamente.';
                notificacion.classList.add('visible');
                setTimeout(() => notificacion.classList.remove('visible'), 3000);
            }
        })
        .catch(error => {
            console.error('Error al verificar sesión:', error);
            localStorage.clear();
            userProfileContainer.innerHTML = `
                <li><img src="../img/img_catalogo/avatar.png" alt="Avatar" class="avatar_img"></li>
                <li class="iniciar_session"><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
            `;
            menuDesplegable.innerHTML = `
                <li><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
                <li><a href="../HTML/index_home.html">Home</a></li>
                <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                <li><a href="#">Contáctanos</a></li>
            `;
            notificacion.textContent = 'Error al verificar la sesión. Por favor, inicia sesión nuevamente.';
            notificacion.classList.add('visible');
            setTimeout(() => notificacion.classList.remove('visible'), 3000);
        });
}

// Cerrar sesión del usuario
function cerrarSesion(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '../HTML/index_login.html?redirect=carrito';
}

// Actualizar datos del usuario
function actualizarDatos() {
    window.location.href = '../HTML/index_actualizar.html';
}

// Actualizar el resumen del carrito
function actualizarResumenCarrito() {
    if (subtotalElement && totalElement && carritoManager.calcularTotal) {
        const total = carritoManager.calcularTotal() || '$0.00';
        subtotalElement.textContent = total;
        totalElement.textContent = total;
    } else {
        console.error('Elementos del DOM o método calcularTotal no disponibles');
        subtotalElement.textContent = '$0.00';
        totalElement.textContent = '$0.00';
    }
}

// Manejar la compra
function manejarCompra() {
    if (!localStorage.getItem('usuarioId')) {
        window.location.href = '../HTML/index_login.html?redirect=carrito';
        return;
    }

    const carrito = carritoManager.init();
    if (carrito.length === 0) {
        notificacion.textContent = 'El carrito está vacío. Agrega productos antes de comprar.';
        notificacion.classList.add('visible');
        setTimeout(() => notificacion.classList.remove('visible'), 3000);
        return;
    }

    confirmacionModal.style.display = 'block';
    document.querySelector('.confirmar-btn').addEventListener('click', () => {
        fetch(`${API_URL}/ordenes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: localStorage.getItem('usuarioId'),
                productos: carrito,
                total: carritoManager.calcularTotal().replace('$', '').replace('.', '')
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al procesar la compra');
                return response.json();
            })
            .then(data => {
                notificacion.textContent = `Compra realizada con éxito. ID de orden: ${data.id_orden}`;
                notificacion.classList.add('visible');
                setTimeout(() => notificacion.classList.remove('visible'), 3000);

                localStorage.removeItem('carrito');
                localStorage.setItem('totalCartCount', '0');
                carritoManager.renderizarCarrito();
                actualizarResumenCarrito();
                confirmacionModal.style.display = 'none';
                mostrarDetalleVenta(carrito, data.id_orden);
            })
            .catch(error => {
                console.error('Error en la compra:', error);
                notificacion.textContent = 'Error al procesar la compra. Intenta de nuevo.';
                notificacion.classList.add('visible');
                setTimeout(() => notificacion.classList.remove('visible'), 3000);
            });
    }, { once: true }); // Asegura que el evento se ejecute solo una vez

    document.querySelector('.cancelar-btn').addEventListener('click', () => {
        confirmacionModal.style.display = 'none';
    }, { once: true });
}

// Mostrar detalle de la venta
function mostrarDetalleVenta(carrito, idOrden) {
    const detalleLista = document.getElementById('detalle-venta-lista');
    detalleLista.innerHTML = `<p>Orden #${idOrden}</p><ul>${carrito.map(p => `<li>${p.nombre} x${p.cantidad} - $${(p.precio_venta * p.cantidad).toLocaleString('es-CO')}</li>`).join('')}</ul><p>Total: ${carritoManager.calcularTotal()}</p>`;
    detalleVentaModal.style.display = 'block';

    document.querySelector('.cerrar-detalle-btn').addEventListener('click', () => {
        detalleVentaModal.style.display = 'none';
    }, { once: true });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    carritoManager.renderizarCarrito();
    actualizarResumenCarrito();

    if (btnComprar) {
        btnComprar.addEventListener('click', manejarCompra);
    }

    document.querySelector('#btn_menu').addEventListener('change', function () {
        document.body.classList.toggle('menu_active', this.checked);
        const containerMenu = document.querySelector('.container_menu_desple');
        containerMenu.classList.toggle('active', this.checked);
    });

    const header = document.querySelector('header');
    const alturaHeader = parseFloat(getComputedStyle(header).height);
    window.addEventListener('scroll', () => {
        let opa = window.scrollY === 0 ? '80%' : window.scrollY >= alturaHeader && window.scrollY < 2 * alturaHeader ? '100%' : '80%';
        header.style.setProperty('opacity', opa);
    });
});