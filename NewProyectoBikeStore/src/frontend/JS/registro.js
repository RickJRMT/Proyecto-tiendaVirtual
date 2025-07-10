// API URL base
const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const registroForm = document.getElementById('formularioCliente');
const nombre = document.getElementById('nombre');
const apellido = document.getElementById('apellido');
const telefono = document.getElementById('telefono');
const direccion = document.getElementById('direccion');
const correo = document.getElementById('correo');
const claveInput = document.getElementById('contraseña');
const confirmarClaveInput = document.getElementById('confirmar_contraseña');
const terminos = document.getElementById('terminos');

// Contenedor para mensajes
const mensajeDiv = document.createElement('div');
mensajeDiv.classList.add('mensaje');
if (registroForm) {
    registroForm.insertBefore(mensajeDiv, registroForm.firstChild);
}

// Restringir entrada en los campos
if (nombre) {
    nombre.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });
}
if (apellido) {
    apellido.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });
}
  const charCode = direccion.charCode;
  if (charCode == 37 || charCode == 47 || charCode == 64) {
    return false;
  }

function restringirCaracteres(direccion) {
  direccion.value = direccion.value.replace(/[@/%]/g, '');
}

if (telefono) {
    telefono.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}

// Events Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario ya está autenticado
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioId) {
        window.location.href = '../HTML/index_home.html';
        return;
    }

    // Escuchar el envío del formulario
    if (registroForm) {
        registroForm.addEventListener('submit', manejarRegistro);
    }

    // Mostrar y cerrar el modal de términos y condiciones
    const modal = document.getElementById('modal_terminos');
    const abrirModal = document.getElementById('abrir_modal');
    const cerrarModal = document.getElementById('cerrar_modal');

    if (abrirModal) {
        abrirModal.addEventListener('click', (e) => {
            e.preventDefault();
            if (modal) modal.style.display = 'block';
        });
    }

    if (cerrarModal) {
        cerrarModal.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Función para manejar el registro
async function manejarRegistro(e) {
    e.preventDefault();

    // Obtener valores del formulario
    const nombreValue = nombre.value;
    const apellidoValue = apellido.value;
    const telefonoValue = telefono.value;
    const direccionValue = direccion.value;
    const correoValue = correo.value;
    const clave = claveInput.value;
    const confirmarClave = confirmarClaveInput.value;
    const terminosChecked = terminos.checked;

    // Validar que el nombre contenga solo letras
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regexLetras.test(nombreValue)) {
        mostrarMensaje('El nombre solo puede contener letras', false);
        return;
    }

    // Validar que el apellido contenga solo letras
    if (!regexLetras.test(apellidoValue)) {
        mostrarMensaje('El apellido solo puede contener letras', false);
        return;
    }

    // Validacion de correo electronico
    const valCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!valCorreo.test(correoValue)){
        mostrarMensaje('El correo no es valido', false);
        return;
    }

    // Validar que el teléfono contenga solo números
    const regexTelefono = /^[0-9]+$/;
    if (!regexTelefono.test(telefonoValue)) {
        mostrarMensaje('El teléfono solo puede contener números', false);
        return;
    }

    // Validar que las contraseñas coincidan
    if (clave !== confirmarClave) {
        mostrarMensaje('Las contraseñas no coinciden', false);
        return;
    }

    // Validar que los términos estén aceptados
    if (!terminosChecked) {
        mostrarMensaje('Debes aceptar los términos y condiciones', false);
        return;
    }

    // Crear objeto de usuario
    const usuario = {
        nombre: nombreValue,
        apellido: apellidoValue,
        telefono: telefonoValue,
        direccion: direccionValue,
        correo: correoValue,
        clave: clave,
        rol: 'cliente'
    };

    try {
        console.log('Enviando datos al backend:', usuario);
        const response = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });

        const resultado = await response.json();
        console.log('Respuesta del servidor:', resultado);

        if (resultado.success) {
            mostrarMensaje('Registro exitoso. Redirigiendo al inicio de sesión...', true);
            setTimeout(() => {
                window.location.href = '../HTML/index_login.html';
            }, 2000);
        } else {
            mostrarMensaje(resultado.message || 'Error desconocido', false);
        }
    } catch (error) {
        console.error('Error detallado:', error);
        mostrarMensaje('Error al procesar el registro. Intente nuevamente.', false);
    }
}

// Función para mostrar mensajes
function mostrarMensaje(texto, esExito) {
    mensajeDiv.textContent = texto;
    mensajeDiv.style.display = 'block';

    if (esExito) {
        mensajeDiv.classList.remove('error');
        mensajeDiv.classList.add('success');
    } else {
        mensajeDiv.classList.remove('success');
        mensajeDiv.classList.add('error');
    }

    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 3000);
}