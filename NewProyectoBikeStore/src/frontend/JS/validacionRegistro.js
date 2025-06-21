const correo = document.querySelector('#correo');
const contra = document.querySelector('#contraseña');

correo.addEventListener('blur', validar);
contra.addEventListener('blur', validarc);

function validar(e) {
    if (e.target.id === 'correo') {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/i;
        const result = regex.test(e.target.value);

        if (!result) {
            alert('Correo no válido');
            return;
        }
    }
}

function validarc(e) {
    if (e.target.id === 'contraseña') {
        const regex = /^.{8,}$/;
        const result = regex.test(e.target.value);

        if (!result) {
            alert('La contraseña debe tener más de 8 caracteres');
            return;
        }
    }
}