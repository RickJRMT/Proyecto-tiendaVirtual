document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const productos = document.querySelectorAll('.product');
    const contadorCarrito = document.getElementById('contador_carrito');
    const notificacion = document.getElementById('notificacion');
    let totalCarrito = 0;

    // Función para actualizar el contador del carrito
    const actualizarContadorCarrito = () => {
        contadorCarrito.textContent = totalCarrito;
        contadorCarrito.classList.toggle('hidden', totalCarrito === 0);
    };

    // Función para mostrar la notificación
    const mostrarNotificacion = (mensaje) => {
        notificacion.textContent = mensaje;
        notificacion.classList.remove('hidden');
        notificacion.classList.add('visible');

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notificacion.classList.remove('visible');
            notificacion.classList.add('hidden');
        }, 3000);
    };

    // Configurar eventos para cada producto
    productos.forEach(producto => {
        const botonAumentar = producto.querySelector('.aumentar-btn');
        const botonDisminuir = producto.querySelector('.disminuir-btn');
        const entradaCantidad = producto.querySelector('.mostrar-cantidad');
        const botonAgregar = producto.querySelector('.agregar_carrito');

        // Aumentar cantidad
        botonAumentar.addEventListener('click', () => {
            let cantidad = parseInt(entradaCantidad.value) || 1;
            cantidad++;
            entradaCantidad.value = cantidad;
        });

        // Disminuir cantidad (mínimo 1)
        botonDisminuir.addEventListener('click', () => {
            let cantidad = parseInt(entradaCantidad.value) || 1;
            if (cantidad > 1) {
                cantidad--;
                entradaCantidad.value = cantidad;
            }
        });

        // Añadir al carrito
        botonAgregar.addEventListener('click', () => {
            const cantidad = parseInt(entradaCantidad.value) || 1;
            totalCarrito += cantidad;
            entradaCantidad.value = 1; // Resetear a 1
            actualizarContadorCarrito();
            mostrarNotificacion(`Se ha añadido ${cantidad} producto${cantidad > 1 ? 's' : ''} al carrito`);
        });
    });

    // Inicializar el contador
    actualizarContadorCarrito();
});



// Menu hamburguesa
document.querySelector('#btn_menu').addEventListener('change', function () {
    if (this.checked) {
        // se agregará esta clase al body para desactivar el scroll, pues 
        //se emplea en el "overflow"
        document.body.classList.add('menu_active');
    } else {
        // pero si el checkbox no está marcado, pues se removerá esa clase "menu-active"
        document.body.classList.remove('menu_active');
    }
});

//cambiar color

// En el HTML buscará el Header y lo guardará en la variable
var header = document.querySelector('header')

//obtiene la altura del <header> en píxeles
alturaHeader = parseFloat(getComputedStyle(header).height)
//Cada vez que el usuario haga scroll en la ventana de windows, esta función se ejecutará.
window.addEventListener('scroll', e => {
    var opa;

    // en funcion de la posición del scroll, a la variable "opa" se le asignará una opacidad
    if (window.scrollY == 0) {
        opa = '80%';
    } else if (window.scrollY >= alturaHeader &&
        window.scrollY < 2 * alturaHeader) {
        opa = '100%'
    }
    // cambiará el color del header a través de la variable "opa que ya ha  almacenado el valor"
    header.style.setProperty('opacity', opa)
})