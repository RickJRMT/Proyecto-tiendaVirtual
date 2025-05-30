// API URL base
const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const userProfileContainer = document.querySelector('.users');
const menuDesplegable = document.querySelector('.cont_menu ul');
const productosCarritoContainer = document.querySelector('.productos');
const elementoSubtotal = document.getElementById('subtotal');
const elementoTotal = document.getElementById('total');
const contadorCarrito = document.getElementById('contador_carrito');
const botonIniciarCompra = document.getElementById('iniciar-compra');
const confirmacionModal = document.getElementById('confirmacion-modal');
const notificacion = document.getElementById('notificacion');
const detalleVentaModal = document.getElementById('detalle-venta-modal');
const detalleVentaLista = document.getElementById('detalle-venta-lista');
const cerrarDetalleBtn = detalleVentaModal.querySelector('.cerrar-detalle-btn');

// Modal de login requerido
const loginRequiredModal = document.createElement('div');
loginRequiredModal.className = 'login-required-modal';
loginRequiredModal.innerHTML = `
    <div class="login-required-content">
        <p>Debes iniciar sesión o registrarte para realizar una compra.</p>
        <div class="login-required-buttons">
            <a href="../HTML/index_login.html?redirect=carrito" class="login-btn">Iniciar Sesión</a>
            <button class="cancel-btn">Cancelar</button>
        </div>
    </div>
`;
document.body.appendChild(loginRequiredModal);

const loginModalCancelBtn = loginRequiredModal.querySelector('.cancel-btn');

// Seleccionar los botones del modal de confirmación
const botonConfirmar = confirmacionModal.querySelector('.confirmar-btn');
const botonCancelar = confirmacionModal.querySelector('.cancelar-btn');

// Formatear precio
const formatearPrecio = (precio) => {
    return '$' + precio.toLocaleString('es-CO');
};

// Calcular cantidad total de productos en el carrito
const calcularCantidadTotal = () => {
    return carritoManager.carrito.reduce((total, item) => total + item.cantidad, 0);
};

// Actualizar el contador del carrito
const actualizarContadorCarrito = () => {
    const cantidadTotal = calcularCantidadTotal();
    contadorCarrito.textContent = cantidadTotal;
    contadorCarrito.classList.toggle('hidden', cantidadTotal === 0);
};

// Actualizar el total de un producto
const actualizarTotalProducto = (producto) => {
    const cantidad = parseInt(producto.querySelector('.mostrar-cantidad').value) || 0;
    const precioUnitario = parseInt(producto.querySelector('.item-price').getAttribute('data-price')) || 0;
    const total = cantidad * precioUnitario;
    producto.querySelector('.item-total').textContent = formatearPrecio(total);
};

// Actualizar el resumen del carrito
const actualizarResumenCarrito = () => {
    let subtotal = carritoManager.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    elementoSubtotal.textContent = formatearPrecio(subtotal);
    elementoTotal.textContent = formatearPrecio(subtotal);
};

// Mostrar notificaciones
const mostrarNotificacion = (mensaje) => {
    notificacion.textContent = mensaje;
    notificacion.classList.add('mostrar');
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
    }, 3000);
};

// Mostrar y ocultar modal de confirmación
const mostrarModalConfirmacion = () => {
    confirmacionModal.classList.add('mostrar');
};

const ocultarModalConfirmacion = () => {
    confirmacionModal.classList.remove('mostrar');
};

// Mostrar y ocultar modal de login requerido
const mostrarLoginRequiredModal = () => {
    loginRequiredModal.classList.add('mostrar');
};

const ocultarLoginRequiredModal = () => {
    loginRequiredModal.classList.remove('mostrar');
};

// Capturar detalles de la compra
const capturarDetallesCompra = () => {
    let totalGeneral = 0;
    const detalles = [];
    carritoManager.carrito.forEach(producto => {
        const precioUnitario = producto.precio;
        const cantidad = producto.cantidad;
        const total = precioUnitario * cantidad;
        totalGeneral += total;
        detalles.push({
            nombre: producto.nombre,
            precioUnitario: formatearPrecio(precioUnitario),
            cantidad,
            total: formatearPrecio(total)
        });
    });
    return { detalles, totalGeneral: formatearPrecio(totalGeneral) };
};

// Mostrar y ocultar modal de detalle de venta
const mostrarDetalleVenta = (compra) => {
    detalleVentaLista.innerHTML = '';
    compra.detalles.forEach(detalle => {
        const detalleItem = document.createElement('p');
        detalleItem.textContent = `${detalle.nombre} - Precio: ${detalle.precioUnitario} - Cantidad: ${detalle.cantidad} - Total: ${detalle.total}`;
        detalleVentaLista.appendChild(detalleItem);
    });
    const totalItem = document.createElement('p');
    totalItem.classList.add('total-general');
    totalItem.textContent = `Total General: ${compra.totalGeneral}`;
    detalleVentaLista.appendChild(totalItem);
    detalleVentaModal.classList.add('mostrar');
};

const ocultarDetalleVenta = () => {
    detalleVentaModal.classList.remove('mostrar');
};

// Verificar autenticación
function verificarAutenticacion() {
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const usuarioApellido = localStorage.getItem('usuarioApellido');

    if (!usuarioId) {
        userProfileContainer.innerHTML = `
            <li><img src="../img/img_catalogo/avatar.png" alt="" class="avatar_img"></li>
            <li class="iniciar_session"><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
        `;
        menuDesplegable.innerHTML = `
            <li><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
            <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
            <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
            <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
            <li><a href="#">Contáctanos</a></li>
        `;
        return false;
    }

    return fetch(`${API_URL}/auth/verificar/${usuarioId}`)
        .then(response => {
            if (!response.ok) throw new Error('Sesión inválida');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                userProfileContainer.innerHTML = `
                    <div class="profile-info">
                        <div class="profile-image-placeholder"></div>
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
                return true;
            } else {
                localStorage.clear();
                userProfileContainer.innerHTML = `
                    <li><img src="../img/img_catalogo/avatar.png" alt="" class="avatar_img"></li>
                    <li class="iniciar_session"><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
                `;
                menuDesplegable.innerHTML = `
                    <li><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
                    <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                    <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                    <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                    <li><a href="#">Contáctanos</a></li>
                `;
                mostrarNotificacion('Sesión inválida. Por favor, inicia sesión nuevamente.');
                return false;
            }
        })
        .catch(error => {
            console.error('Error al verificar sesión:', error);
            localStorage.clear();
            userProfileContainer.innerHTML = `
                <li><img src="../img/img_catalogo/avatar.png" alt="" class="avatar_img"></li>
                <li class="iniciar_session"><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
            `;
            menuDesplegable.innerHTML = `
                <li><a href="../HTML/index_login.html?redirect=carrito">Iniciar sesión</a></li>
                <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
                <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
                <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
                <li><a href="#">Contáctanos</a></li>
            `;
            mostrarNotificacion('Error al verificar la sesión. Por favor, inicia sesión nuevamente.');
            return false;
        });
}

// Cerrar sesión
function cerrarSesion(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '../HTML/index_login.html?redirect=carrito';
}

// Registrar venta en el backend
async function registrarVenta(compra) {
    const usuarioId = localStorage.getItem('usuarioId');
    const productos = compra.detalles.map(detalle => ({
        id_producto: detalle.id_producto,
        cantidad: detalle.cantidad,
        precio_unitario: parseFloat(detalle.precioUnitario.replace(/[^0-9.]/g, '')),
        total: parseFloat(detalle.total.replace(/[^0-9.]/g, ''))
    }));

    const venta = {
        id_usuario: usuarioId,
        fecha_venta: new Date().toISOString(),
        total: parseFloat(compra.totalGeneral.replace(/[^0-9.]/g, '')),
        productos
    };

    try {
        const response = await fetch(`${API_URL}/ventas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(venta)
        });
        if (!response.ok) throw new Error('Error al registrar la venta');
        return await response.json();
    } catch (error) {
        console.error('Error al registrar la venta:', error);
        throw error;
    }
}

// Actualizar stock en el backend
async function actualizarStock(producto) {
    try {
        const response = await fetch(`${API_URL}/stocks/${producto.id_producto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cantidad: -producto.cantidad })
        });
        if (!response.ok) throw new Error('Error al actualizar el stock');
        return await response.json();
    } catch (error) {
        console.error('Error al actualizar el stock:', error);
        throw error;
    }
}

// Eventos
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    await verificarAutenticacion();

    // Renderizar carrito
    carritoManager.renderizarCarrito();

    // Actualizar totales y contador
    actualizarResumenCarrito();
    actualizarContadorCarrito();

    // Evento para iniciar compra
    botonIniciarCompra.addEventListener('click', async () => {
        const cantidadTotal = calcularCantidadTotal();
        if (cantidadTotal === 0) {
            mostrarNotificacion('El carrito está vacío');
            return;
        }

        const isAuthenticated = await verificarAutenticacion();
        if (!isAuthenticated) {
            mostrarLoginRequiredModal();
            return;
        }

        mostrarModalConfirmacion();
    });

    // Evento para confirmar compra
    botonConfirmar.addEventListener('click', async () => {
        const compra = capturarDetallesCompra();
        try {
            // Registrar venta
            await registrarVenta(compra);

            // Actualizar stock
            for (const producto of carritoManager.carrito) {
                await actualizarStock(producto);
            }

            // Vaciar carrito
            carritoManager.vaciarCarrito();
            productosCarritoContainer.innerHTML = '';
            actualizarResumenCarrito();
            actualizarContadorCarrito();
            mostrarNotificacion('La compra ha finalizado, gracias por comprar con nosotros');
            ocultarModalConfirmacion();
            mostrarDetalleVenta(compra);
        } catch (error) {
            mostrarNotificacion('Error al procesar la compra. Intente nuevamente.');
        }
    });

    // Evento para cancelar compra
    botonCancelar.addEventListener('click', () => {
        ocultarModalConfirmacion();
    });

    // Evento para cerrar modal de detalle de venta
    cerrarDetalleBtn.addEventListener('click', () => {
        ocultarDetalleVenta();
    });

    // Evento para cancelar modal de login requerido
    loginModalCancelBtn.addEventListener('click', () => {
        ocultarLoginRequiredModal();
    });

    // Menú hamburguesa
    document.querySelector('#btn_menu').addEventListener('change', function () {
        document.body.classList.toggle('menu_active', this.checked);
    });

    // Opacidad del header
    const header = document.querySelector('header');
    const alturaHeader = parseFloat(getComputedStyle(header).height);
    window.addEventListener('scroll', () => {
        let opa = window.scrollY === 0 ? '80%' : window.scrollY >= alturaHeader && window.scrollY < 2 * alturaHeader ? '100%' : '80%';
        header.style.setProperty('opacity', opa);
    });
});