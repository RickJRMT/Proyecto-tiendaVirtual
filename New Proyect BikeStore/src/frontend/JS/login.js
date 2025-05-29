// API URL base
const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const loginForm = document.getElementById('formularioLogin');
const correoInput = document.getElementById('correo');
const claveInput = document.getElementById('clave');
const recordar = document.getElementById('recordar');

// Contenedor para mensajes
const mensajeDiv = document.createElement('div');
mensajeDiv.classList.add('mensaje');
if (loginForm) {
    loginForm.insertBefore(mensajeDiv, loginForm.firstChild);
}

// Events Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario ya está autenticado
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioRol = localStorage.getItem('usuarioRol');
    if (usuarioId) {
        if (usuarioRol === 'admin') {
            window.location.href = '../HTML/index_admin.html';
        } else {
            window.location.href = '../HTML/index_home.html';

        }
        return;
    }

    // Escuchar el envío del formulario
    if (loginForm) {
        loginForm.addEventListener('submit', manejarLogin);
    }
});

// Función para manejar el inicio de sesión
async function manejarLogin(e) {
    e.preventDefault();

    // Obtener valores del formulario
    const correoValue = correoInput.value;
    const claveValue = claveInput.value;

    // Crear objeto de credenciales
    const credenciales = {
        correo: correoValue,
        clave: claveValue
    };

    try {
        console.log('Datos enviados al backend:', credenciales);
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credenciales)
        });

        const resultado = await response.json();
        console.log('Respuesta del servidor:', resultado);

        if (response.ok && resultado.success) {
            // Almacenar datos del usuario en localStorage
            localStorage.setItem('usuarioId', resultado.usuarioId);
            localStorage.setItem('usuarioNombre', resultado.nombre);
            localStorage.setItem('usuarioApellido', resultado.apellido);
            localStorage.setItem('usuarioRol', resultado.rol);


            if (recordar.checked) {
                localStorage.setItem('recordarSesion', 'true');
            }

            mostrarMensaje('Inicio de sesión exitoso. Redirigiendo...', true);
            setTimeout(() => {
                // Redirigir según el rol del usuario
                if (resultado.rol === 'admin') {
                    window.location.href = '../HTML/index_admin.html';
                } else {
                    window.location.href = '../HTML/index_home.html';
                }
            }, 2000);
        } else {
            mostrarMensaje(resultado.message || 'Correo o clave incorrectos', false);
        }
    } catch (error) {
        console.error('Error detallado:', error);
        mostrarMensaje('Error al iniciar sesión. Intente nuevamente.', false);
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