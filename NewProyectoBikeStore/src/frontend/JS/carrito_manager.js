const carritoManager = {
    // Inicializar el carrito desde localStorage
    init() {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        return carrito;
    },

    // Agregar un producto al carrito
    agregarProducto(producto) {
        console.log('Agregando producto al carrito:', producto); // Depuración
        console.log('Imagen del producto:', producto.imagen); // Depuración específica
        let carrito = this.init();
        const productoExistente = carrito.find(item => item.id_producto === producto.id_producto);

        if (productoExistente) {
            productoExistente.cantidad += producto.cantidad;
            // Asegurar que la imagen se mantenga actualizada
            productoExistente.imagen = producto.imagen;
        } else {
            carrito.push(producto);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        this.actualizarContador();
        // Solo ejecutar renderizarCarrito y actualizarResumen si estamos en la página del carrito
        if (document.getElementById('contenedorCarrito')) {
            this.renderizarCarrito();
            this.actualizarResumen();
        }
        console.log('Carrito actualizado:', carrito);
    },

    // Eliminar un producto del carrito
    eliminarProducto(idProducto) {
        console.log('Eliminando producto ID:', idProducto); // Depuración
        let carrito = this.init();
        const index = carrito.findIndex(item => item.id_producto === idProducto);
        if (index !== -1) {
            carrito.splice(index, 1);
            localStorage.setItem('carrito', JSON.stringify(carrito));
            this.actualizarContador();
            // Solo ejecutar renderizarCarrito y actualizarResumen si estamos en la página del carrito
            if (document.getElementById('contenedorCarrito')) {
                this.renderizarCarrito();
                this.actualizarResumen();
            }
        }
    },

    // Actualizar la cantidad de un producto
    actualizarCantidad(idProducto, nuevaCantidad) {
        console.log('Actualizando cantidad para producto ID:', idProducto, 'Nueva cantidad:', nuevaCantidad); // Depuración
        let carrito = this.init();
        const producto = carrito.find(item => item.id_producto === idProducto);
        if (producto && nuevaCantidad > 0) {
            producto.cantidad = nuevaCantidad;
            localStorage.setItem('carrito', JSON.stringify(carrito));
            this.actualizarContador();
            // Solo ejecutar renderizarCarrito y actualizarResumen si estamos en la página del carrito
            if (document.getElementById('contenedorCarrito')) {
                this.renderizarCarrito();
                this.actualizarResumen();
            }
        }
    },

    // Actualizar el contador total en el DOM y localStorage
    actualizarContador() {
        let carrito = this.init();
        let totalCartCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        localStorage.setItem('totalCartCount', totalCartCount);

        const cartCountElements = document.querySelectorAll('.cart-count, #contador_carrito');
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = totalCartCount;
                element.classList.toggle('hidden', totalCartCount === 0);
            }
        });
        console.log('Contador actualizado:', totalCartCount); // Depuración
    },

    // Renderizar el carrito en el DOM
    renderizarCarrito() {
        const contenedorCarrito = document.getElementById('contenedorCarrito');
        if (!contenedorCarrito) {
            console.log('No se encontró #contenedorCarrito, omitiendo renderizado'); // Depuración
            return;
        }

        let carrito = this.init();
        contenedorCarrito.innerHTML = '';

        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = '<p>El carrito está vacío.</p>';
            return;
        }

        carrito.forEach(producto => {
            console.log(`Renderizando producto: ${producto.nombre}, Imagen: ${producto.imagen}`); // Depuración
            const divProducto = document.createElement('div');
            divProducto.classList.add('producto_carrito');

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('imagen_carrito');
            const img = document.createElement('img');
            img.src = producto.imagen || '../img/no-image.jpg'; // Usar imagen local como respaldo
            img.alt = producto.nombre || 'Producto sin nombre';
            imgContainer.appendChild(img);

            const nombre = document.createElement('span');
            nombre.textContent = producto.nombre || 'Producto sin nombre';

            const precio = document.createElement('span');
            precio.textContent = producto.precio_venta
                ? `$${Number(producto.precio_venta).toLocaleString('es-CO')}`
                : '$0.00';

            const cantidad = document.createElement('input');
            cantidad.type = 'number';
            cantidad.value = producto.cantidad || 1;
            cantidad.min = '1';
            cantidad.classList.add('cantidad_input');
            cantidad.addEventListener('change', (e) => {
                this.actualizarCantidad(producto.id_producto, parseInt(e.target.value) || 1);
            });

            const eliminarBtn = document.createElement('button');
            eliminarBtn.textContent = 'X';
            eliminarBtn.classList.add('eliminar_btn');
            eliminarBtn.addEventListener('click', () => this.eliminarProducto(producto.id_producto));

            divProducto.appendChild(imgContainer);
            divProducto.appendChild(nombre);
            divProducto.appendChild(precio);
            divProducto.appendChild(cantidad);
            divProducto.appendChild(eliminarBtn);

            contenedorCarrito.appendChild(divProducto);
        });
        console.log('Carrito renderizado:', carrito); // Depuración
    },

    // Calcular y actualizar el resumen de la orden
    actualizarResumen() {
        const contenedorCarrito = document.getElementById('contenedorCarrito');
        if (!contenedorCarrito) {
            console.log('No se encontró #contenedorCarrito, omitiendo actualización del resumen'); // Depuración
            return;
        }

        let carrito = this.init();
        const subtotal = carrito.reduce((sum, producto) => {
            const precio = Number(producto.precio_venta) || 0;
            return sum + (precio * producto.cantidad);
        }, 0);
        const iva = subtotal * 0.16; // IVA del 16% para consistencia con HTML
        const total = subtotal + iva;

        // Actualizar los valores en el DOM
        const subtotalElement = document.querySelector('.subtotal');
        const ivaElement = document.querySelector('.iva');
        const totalElement = document.querySelector('.total');

        if (subtotalElement) {
            subtotalElement.textContent = `$${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (ivaElement) {
            ivaElement.textContent = `$${iva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (totalElement) {
            totalElement.textContent = `$${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        console.log('Resumen actualizado - Subtotal:', subtotal, 'IVA:', iva, 'Total:', total); // Depuración
    },

    // Calcular el total del carrito
    calcularTotal() {
        let carrito = this.init();
        const subtotal = carrito.reduce((total, producto) => {
            const precio = Number(producto.precio_venta) || 0;
            return total + (precio * producto.cantidad);
        }, 0);
        const iva = subtotal * 0.16; // IVA del 16% para consistencia
        const total = subtotal + iva;
        return total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    }
};

// Inicializar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página del carrito
    if (document.getElementById('contenedorCarrito')) {
        console.log('Inicializando carritoManager en página con #contenedorCarrito');
        carritoManager.renderizarCarrito();
        carritoManager.actualizarResumen();
    } else {
        console.log('No se encontró #contenedorCarrito, omitiendo inicialización de renderizado y resumen');
    }
    carritoManager.actualizarContador(); // Actualizar contador en todas las páginas

    // Sincronizar contador al cambiar la ventana
    window.addEventListener('storage', () => {
        carritoManager.actualizarContador();
        if (document.getElementById('contenedorCarrito')) {
            carritoManager.renderizarCarrito();
            carritoManager.actualizarResumen();
        }
    });
});

// Exportar para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = carritoManager;
} else {
    window.carritoManager = carritoManager;
}