const carritoManager = {
    // Inicializar el carrito desde localStorage
    init() {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        return carrito;
    },

    // Agregar un producto al carrito
    agregarProducto(producto) {
        let carrito = this.init();
        const productoExistente = carrito.find(item => item.id_producto === producto.id_producto);

        if (productoExistente) {
            productoExistente.cantidad += producto.cantidad;
        } else {
            carrito.push(producto);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        this.actualizarContador();
        this.renderizarCarrito();
        this.actualizarResumen(); // Añadir actualización del resumen
        console.log('Producto agregado al carrito:', producto);
    },

    // Eliminar un producto del carrito
    eliminarProducto(idProducto) {
        let carrito = this.init();
        const index = carrito.findIndex(item => item.id_producto === idProducto);
        if (index !== -1) {
            carrito.splice(index, 1);
            localStorage.setItem('carrito', JSON.stringify(carrito));
            this.actualizarContador();
            this.renderizarCarrito();
            this.actualizarResumen(); // Añadir actualización del resumen
        }
    },

    // Actualizar la cantidad de un producto
    actualizarCantidad(idProducto, nuevaCantidad) {
        let carrito = this.init();
        const producto = carrito.find(item => item.id_producto === idProducto);
        if (producto && nuevaCantidad > 0) {
            producto.cantidad = nuevaCantidad;
            localStorage.setItem('carrito', JSON.stringify(carrito));
            this.actualizarContador();
            this.renderizarCarrito();
            this.actualizarResumen(); // Añadir actualización del resumen
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
    },

    // Renderizar el carrito en el DOM
    renderizarCarrito() {
        const contenedorCarrito = document.getElementById('contenedorCarrito');
        if (!contenedorCarrito) {
            console.error('El contenedor #contenedorCarrito no existe en el DOM');
            return;
        }

        let carrito = this.init();
        contenedorCarrito.innerHTML = '';

        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = '<p>El carrito está vacío.</p>';
            return;
        }

        carrito.forEach(producto => {
            const divProducto = document.createElement('div');
            divProducto.classList.add('producto_carrito');

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('imagen_carrito');
            const img = document.createElement('img');
            img.src = producto.imagen || 'https://via.placeholder.com/50?text=Sin+Imagen';
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
            eliminarBtn.textContent = 'X'; // Cambiado a 'X' para usar el estilo existente
            eliminarBtn.classList.add('eliminar_btn');
            eliminarBtn.addEventListener('click', () => this.eliminarProducto(producto.id_producto));

            divProducto.appendChild(imgContainer);
            divProducto.appendChild(nombre);
            divProducto.appendChild(precio);
            divProducto.appendChild(cantidad);
            divProducto.appendChild(eliminarBtn);

            contenedorCarrito.appendChild(divProducto);
        });
    },

    // Calcular y actualizar el resumen de la orden
    actualizarResumen() {
        let carrito = this.init();
        const subtotal = carrito.reduce((sum, producto) => {
            const precio = Number(producto.precio_venta) || 0;
            return sum + (precio * producto.cantidad);
        }, 0);
        const iva = subtotal * 0.19; // IVA del 19% para Colombia (ajusta según tu país)
        const total = subtotal + iva;

        // Actualizar los valores en el DOM
        document.querySelector('.subtotal').textContent = `$${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.querySelector('.iva').textContent = `$${iva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.querySelector('.total').textContent = `$${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    // Calcular el total del carrito (puedes mantenerlo o integrarlo en actualizarResumen)
    calcularTotal() {
        let carrito = this.init();
        return carrito.reduce((total, producto) => {
            const precio = Number(producto.precio_venta) || 0;
            return total + (precio * producto.cantidad);
        }, 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    }
};

// Inicializar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    carritoManager.renderizarCarrito();
    carritoManager.actualizarContador();
    carritoManager.actualizarResumen(); // Inicializar el resumen al cargar

    // Sincronizar contador al cambiar la ventana
    window.addEventListener('storage', () => {
        carritoManager.actualizarContador();
        carritoManager.renderizarCarrito();
        carritoManager.actualizarResumen(); // Actualizar resumen en cambios de storage
    });
});

// Exportar para uso en otros scripts (si usas módulos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = carritoManager;
} else {
    window.carritoManager = carritoManager;
}