// URL base de la API
const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const userProfileContainer = document.querySelector('.users'); // Contenedor para el perfil del usuario
const menuDesplegable = document.querySelector('#menuDesplegable'); // Menú desplegable de navegación
const contenedorCarrito = document.getElementById('contenedorCarrito'); // Contenedor del carrito
const subtotalElement = document.querySelector('.subtotal'); // Elemento para mostrar el subtotal
const ivaElement = document.querySelector('.iva'); // Elemento para mostrar el IVA
const totalElement = document.querySelector('.total'); // Elemento para mostrar el total
const btnComprar = document.querySelector('.comprar-btn'); // Botón para iniciar la compra
const confirmacionModal = document.getElementById('confirmacion-modal'); // Modal de confirmación de compra
const detalleVentaModal = document.getElementById('detalle-venta-modal'); // Modal de detalle de venta
const notificacion = document.getElementById('notificacion'); // Elemento para notificaciones
const profileModal = document.querySelector('#profileModal'); // Modal de perfil de usuario

/**
 * Verifica si el usuario está autenticado consultando la API y actualiza la interfaz.
 */
function verificarAutenticacion() {
  const usuarioId = localStorage.getItem('usuarioId');
  const usuarioNombre = localStorage.getItem('usuarioNombre');
  const usuarioApellido = localStorage.getItem('usuarioApellido');

  if (!usuarioId) {
    // Si no hay usuario autenticado, muestra la opción de iniciar sesión
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

  // Verificar la autenticación del usuario con la API
  fetch(`${API_URL}/auth/verificar/${usuarioId}`)
    .then(response => {
      if (!response.ok) throw new Error('Sesión inválida');
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Si el usuario está autenticado, muestra su información
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
          <li><a href="../HTML/index_home.html">Home</a></li>
          <li><a href="../HTML/index_catalogo.html">Bicicletas</a></li>
          <li><a href="../HTML/index_catalogo.html">Accesorios</a></li>
          <li><a href="../HTML/index_catalogo.html">Repuestos</a></li>
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
        // Si la verificación falla, limpia el localStorage y muestra la opción de iniciar sesión
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

/**
 * Cierra la sesión del usuario, limpia el localStorage y redirige a la página de login.
 * @param {Event} e - Evento del clic en el botón de cerrar sesión.
 */
function cerrarSesion(e) {
  e.preventDefault();
  localStorage.clear();
  window.location.href = '../HTML/index_login.html?redirect=carrito';
}

/**
 * Redirige a la página de actualización de datos del usuario.
 */
function actualizarDatos() {
  window.location.href = '../HTML/index_actualizarUser.html';
}

/**
 * Actualiza el resumen del carrito (subtotal, IVA, total) en la interfaz.
 */
function actualizarResumenCarrito() {
  if (subtotalElement && ivaElement && totalElement && carritoManager.calcularTotal) {
    const subtotal = carritoManager.init().reduce((sum, producto) => {
      const precio = Number(producto.precio_venta) || 0;
      return sum + (precio * producto.cantidad);
    }, 0);
    const iva = subtotal * 0.16; // IVA del 16% para consistencia con HTML
    const total = subtotal + iva;

    console.log('Resumen del carrito - Subtotal:', subtotal, 'IVA:', iva, 'Total:', total); // Depuración

    subtotalElement.textContent = `$${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    ivaElement.textContent = `$${iva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    totalElement.textContent = `$${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    console.error('Elementos del DOM o método calcularTotal no disponibles');
    subtotalElement.textContent = '$0.00';
    ivaElement.textContent = '$0.00';
    totalElement.textContent = '$0.00';
  }
}

/**
 * Maneja el proceso de compra, incluyendo la validación de autenticación, creación de la venta,
 * y muestra del modal de detalle de venta.
 */
async function manejarCompra() {
  if (!localStorage.getItem('usuarioId')) {
    // Mostrar modal si el usuario no está autenticado
    const loginModal = document.createElement('div');
    loginModal.classList.add('login-required-modal');
    loginModal.innerHTML = `
      <div class="login-required-content">
        <p>Debes iniciar sesión para realizar la compra.</p>
        <div class="login-required-buttons">
          <a href="../HTML/index_login.html?redirect=carrito" class="login-btn">Iniciar sesión</a>
          <button class="cancel-btn">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(loginModal);
    loginModal.style.display = 'block';
    loginModal.classList.add('visible');

    loginModal.querySelector('.cancel-btn').addEventListener('click', () => {
      loginModal.style.display = 'none';
      loginModal.classList.remove('visible');
      document.body.removeChild(loginModal);
    }, { once: true });
    return;
  }

  const carrito = carritoManager.init();
  if (carrito.length === 0) {
    notificacion.textContent = 'El carrito está vacío. Agrega productos antes de comprar.';
    notificacion.classList.add('visible');
    setTimeout(() => notificacion.classList.remove('visible'), 3000);
    return;
  }

  // Mostrar modal de confirmación
  if (confirmacionModal.style.display !== 'block') {
    confirmacionModal.style.display = 'block';
    confirmacionModal.classList.add('visible');
  }

  document.querySelector('.confirmar-btn').addEventListener('click', async () => {
    try {
      // Crear la venta en el backend
      const response = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: localStorage.getItem('usuarioId'),
          productos: carrito,
          total: parseFloat(carritoManager.calcularTotal().replace('$', '').replace(/,/g, '')),
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error || 'Error al procesar la venta'}`);
      }
      const data = await response.json();

      // Obtener los detalles de la venta
      const ventaResponse = await fetch(`${API_URL}/ventas/${data.id_venta}`);
      if (!ventaResponse.ok) {
        throw new Error('Error al obtener los detalles de la venta');
      }
      const ventaData = await ventaResponse.json();

      // Vaciar el carrito
      localStorage.removeItem('carrito');
      localStorage.setItem('totalCartCount', '0');

      // Mostrar mensaje de éxito
      notificacion.textContent = `Compra realizada con éxito. ID de venta: ${data.id_venta}`;
      notificacion.classList.add('visible');
      setTimeout(() => notificacion.classList.remove('visible'), 3000);

      // Actualizar la interfaz
      carritoManager.renderizarCarrito();
      carritoManager.actualizarContador();
      actualizarResumenCarrito();
      confirmacionModal.style.display = 'none';
      confirmacionModal.classList.remove('visible');

      // Mostrar el modal de detalle de venta
      mostrarDetalleVenta(ventaData);
    } catch (error) {
      console.error('Error en la compra:', error);
      let mensajeError = 'Error al procesar la compra. Intenta de nuevo.';
      if (error.message.includes('404')) {
        mensajeError = 'El servidor no está disponible. Verifica la conexión con el backend.';
      } else if (error.message.includes('400')) {
        mensajeError = 'Error en los datos de la compra. Verifica los productos seleccionados.';
      } else if (error.message.includes('500')) {
        mensajeError = 'Error interno del servidor. Contacta al administrador.';
      }
      notificacion.textContent = mensajeError;
      notificacion.classList.add('visible');
      setTimeout(() => notificacion.classList.remove('visible'), 3000);
      confirmacionModal.style.display = 'none';
      confirmacionModal.classList.remove('visible');
    }
  }, { once: true });

  document.querySelector('.cancelar-btn').addEventListener('click', () => {
    confirmacionModal.style.display = 'none';
    confirmacionModal.classList.remove('visible');
  }, { once: true });
}

/**
 * Muestra un modal con los detalles de la venta, incluyendo productos, cantidades, precios y total.
 * @param {Object} venta - Objeto con los datos de la venta obtenidos del backend.
 */
function mostrarDetalleVenta(venta) {
  const detalleLista = document.getElementById('detalle-venta-lista');
  console.log('Datos de la venta:', venta); // Depuración
  console.log('Detalles de la venta:', venta.detalles); // Depuración
  const total = venta.detalles.reduce((sum, detalle) => {
    const detalleTotal = parseFloat(detalle.total) || 0; // Convertir a número
    console.log(`Procesando detalle: ${detalle.nombre}, Total: ${detalleTotal}`); // Depuración
    return sum + detalleTotal;
  }, 0);
  console.log('Total calculado:', total); // Depuración

  detalleLista.innerHTML = `
    <h3>Venta #${venta.id_venta}</h3>
    <p>Fecha: ${new Date(venta.fecha_venta).toLocaleString('es-CO')}</p>
    <p>Estado: ${venta.estado}</p>
    <ul>
      ${venta.detalles.map(detalle => `
        <li>
          ${detalle.nombre} x${detalle.cantidad} - 
          $${(parseFloat(detalle.precio_unitario) || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })} c/u - 
          Subtotal: $${(parseFloat(detalle.total) || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
        </li>
      `).join('')}
    </ul>
    <p>Total: $${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  `;
  detalleVentaModal.style.display = 'block';
  detalleVentaModal.classList.add('visible');

  document.querySelector('.cerrar-detalle-btn').addEventListener('click', () => {
    detalleVentaModal.style.display = 'none';
    detalleVentaModal.classList.remove('visible');
  }, { once: true });
}

/**
 * Inicializa la página del carrito, configurando eventos y actualizando la interfaz.
 */
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacion(); // Verifica la autenticación del usuario
  carritoManager.renderizarCarrito(); // Renderiza los productos del carrito
  carritoManager.actualizarContador(); // Actualiza el contador de productos
  actualizarResumenCarrito(); // Actualiza el resumen de precios

  if (btnComprar) {
    btnComprar.addEventListener('click', manejarCompra); // Asocia el evento de compra al botón
  }

  // Configurar el menú hamburguesa
  document.querySelector('#btn_menu').addEventListener('change', function () {
    document.body.classList.toggle('menu_active', this.checked);
    const containerMenu = document.querySelector('.container_menu_desple');
    containerMenu.classList.toggle('active', this.checked);
  });

  // Ajustar la opacidad del header al hacer scroll
  const header = document.querySelector('header');
  const alturaHeader = parseFloat(getComputedStyle(header).height);
  window.addEventListener('scroll', () => {
    let opa = window.scrollY === 0 ? '80%' : window.scrollY >= alturaHeader && window.scrollY < 2 * alturaHeader ? '100%' : '80%';
    header.style.setProperty('opacity', opa);
  });
});