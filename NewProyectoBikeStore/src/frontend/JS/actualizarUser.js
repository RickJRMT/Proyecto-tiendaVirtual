const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const elements = {
    form: document.getElementById('formularioActualizar'),
    nombre: document.getElementById('nombre'),
    apellido: document.getElementById('apellido'),
    telefono: document.getElementById('telefono'),
    direccion: document.getElementById('direccion'),
    correo: document.getElementById('correo'),
    contrasena: document.getElementById('contrasena'),
    confirmarContrasena: document.getElementById('confirmar_contrasena'),
    terminos: document.getElementById('terminos'),
    btnActualizar: document.getElementById('btn_actualizar'),
    btnVolver: document.getElementById('btn_volver'),
    notificacion: document.getElementById('notificacion'),
    modal: document.getElementById('modal_terminos'),
    abrirModal: document.getElementById('abrir_modal'),
    cerrarModal: document.getElementById('cerrar_modal')
};

// Crear contenedor para mensajes
const mensajeDiv = document.createElement('div');
mensajeDiv.classList.add('mensaje');
elements.form?.prepend(mensajeDiv);

// Restringir entrada en campos
function restringirEntrada(input, regex) {
    input?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(regex, '');
    });
}
restringirEntrada(elements.nombre, /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g);
restringirEntrada(elements.apellido, /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g);
restringirEntrada(elements.telefono, /[^0-9]/g);

// Mostrar notificaciones
function mostrarNotificacion(texto, esExito) {
    mensajeDiv.textContent = texto;
    mensajeDiv.style.display = 'block';
    mensajeDiv.classList.toggle('success', esExito);
    mensajeDiv.classList.toggle('error', !esExito);
    setTimeout(() => mensajeDiv.style.display = 'none', 3000);

    elements.notificacion.textContent = texto;
    elements.notificacion.classList.add('visible');
    setTimeout(() => elements.notificacion.classList.remove('visible'), 3000);
}

// Verificar autenticación
async function verificarSesion() {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
        window.location.href = '../HTML/index_login.html';
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/auth/verificar/${usuarioId}`);
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        const data = await response.json();
        if (!data.success) {
            localStorage.clear();
            window.location.href = '../HTML/index_login.html';
            return null;
        }
        return usuarioId;
    } catch (error) {
        console.error('Error al verificar sesión:', error.message);
        localStorage.clear();
        window.location.href = '../HTML/index_login.html';
        return null;
    }
}

// Cargar datos del usuario
async function cargarDatos(usuarioId) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}`);
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        const data = await response.json();
        console.log('Datos recibidos (GET /usuarios):', data);

        const usuario = data.data || data;
        if (!usuario || typeof usuario !== 'object') {
            throw new Error('Formato de datos inválido');
        }

        elements.nombre.value = usuario.nombre || '';
        elements.apellido.value = usuario.apellido || '';
        elements.telefono.value = usuario.telefono || '';
        elements.direccion.value = usuario.direccion || '';
        elements.correo.value = usuario.correo || '';
    } catch (error) {
        console.error('Error al cargar datos:', error.message);
        mostrarNotificacion('No se pudieron cargar los datos del usuario.', false);
    }
}

// Validar formulario
function validarFormulario(datos) {
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const regexTelefono = /^[0-9]+$/;

    if (!regexLetras.test(datos.nombre)) {
        mostrarNotificacion('El nombre solo puede contener letras.', false);
        return false;
    }
    if (!regexLetras.test(datos.apellido)) {
        mostrarNotificacion('El apellido solo puede contener letras.', false);
        return false;
    }
    if (!regexTelefono.test(datos.telefono)) {
        mostrarNotificacion('El teléfono solo puede contener números.', false);
        return false;
    }
    if (datos.contrasena && datos.contrasena !== datos.confirmarContrasena) {
        mostrarNotificacion('Las contraseñas no coinciden.', false);
        return false;
    }
    if (!datos.terminos) {
        mostrarNotificacion('Debes aceptar los términos y condiciones.', false);
        return false;
    }
    return true;
}

// Manejar actualización
async function actualizarUsuario(e) {
    e.preventDefault();

    const datos = {
        nombre: elements.nombre.value.trim(),
        apellido: elements.apellido.value.trim(),
        telefono: elements.telefono.value.trim(),
        direccion: elements.direccion.value.trim(),
        contrasena: elements.contrasena.value,
        confirmarContrasena: elements.confirmarContrasena.value,
        terminos: elements.terminos.checked
    };

    if (!validarFormulario(datos)) return;

    const payload = {
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        direccion: datos.direccion
    };
    if (datos.contrasena) payload.clave = datos.contrasena;

    try {
        const usuarioId = localStorage.getItem('usuarioId');
        if (!usuarioId) throw new Error('ID de usuario no encontrado');

        console.log('Enviando actualización:', payload);
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resultado = await response.json();
        console.log('Respuesta del servidor (PUT /usuarios):', resultado);

        // Considerar la petición exitosa si el código HTTP es 200
        if (response.ok) {
            localStorage.setItem('usuarioNombre', datos.nombre);
            localStorage.setItem('usuarioApellido', datos.apellido);
            mostrarNotificacion('Datos actualizados correctamente.', true);
            elements.btnActualizar.disabled = true;
            elements.btnVolver.value = 'Volver';
        } else {
            mostrarNotificacion(resultado.message || 'No se pudo actualizar los datos.', false);
        }
    } catch (error) {
        console.error('Error en actualización:', error.message);
        mostrarNotificacion(`Error: ${error.message}`, false);
    }
}

// Configurar eventos
function inicializar() {
    // Verificar autenticación y cargar datos
    verificarSesion().then(usuarioId => {
        if (usuarioId) cargarDatos(usuarioId);
    });

    // Evento del formulario
    elements.form?.addEventListener('submit', actualizarUsuario);

    // Evento del botón Volver
    elements.btnVolver?.addEventListener('click', () => {
        window.location.href = '../HTML/index_home.html';
    });

    // Eventos del modal
    elements.abrirModal?.addEventListener('click', (e) => {
        e.preventDefault();
        elements.modal.style.display = 'block';
    });

    elements.cerrarModal?.addEventListener('click', () => {
        elements.modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            elements.modal.style.display = 'none';
        }
    });
}

// Iniciar
document.addEventListener('DOMContentLoaded', inicializar);