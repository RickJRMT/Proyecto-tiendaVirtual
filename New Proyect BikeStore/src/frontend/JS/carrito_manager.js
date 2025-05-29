// Clase para manejar el carrito de compras
class CarritoManager {
    constructor() {
        // Inicializar el carrito desde localStorage o crear uno vacío
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.actualizarContadorCarrito();
        // Inicializar el contador de IDs
        this.ultimoId = Math.max(...this.carrito.map(item => parseInt(item.id) || 0), 0);
    }

    // Método para generar un ID único
    generarIdUnico() {
        this.ultimoId++;
        return this.ultimoId.toString();
    }

    // Método para agregar un producto al carrito
    agregarProducto(producto) {
        // Si el producto no tiene ID, generar uno nuevo
        if (!producto.id) {
            producto.id = this.generarIdUnico();
        }
        
        // Buscar si el producto ya existe en el carrito
        const productoExistente = this.carrito.find(item => 
            item.nombre === producto.nombre && 
            item.precio === producto.precio
        );
        
        if (productoExistente) {
            // Si existe, actualizar la cantidad
            productoExistente.cantidad += producto.cantidad;
            this.mostrarNotificacion(`Se actualizó la cantidad de ${producto.nombre} a ${productoExistente.cantidad}`);
        } else {
            // Si no existe, agregarlo al carrito
            this.carrito.push(producto);
            this.mostrarNotificacion(`Se agregó ${producto.nombre} al carrito`);
        }

        // Guardar en localStorage
        this.guardarCarrito();
        // Actualizar el contador
        this.actualizarContadorCarrito();
    }

    // Método para actualizar la cantidad de un producto
    actualizarCantidad(id, nuevaCantidad) {
        const producto = this.carrito.find(item => item.id === id);
        if (producto) {
            producto.cantidad = nuevaCantidad;
            if (producto.cantidad <= 0) {
                this.eliminarProducto(id);
            } else {
                this.guardarCarrito();
                this.actualizarContadorCarrito();
                this.renderizarCarrito();
                this.mostrarNotificacion(`Cantidad actualizada: ${producto.nombre} x${nuevaCantidad}`);
            }
        }
    }

    // Método para eliminar un producto del carrito
    eliminarProducto(id) {
        const producto = this.carrito.find(item => item.id === id);
        if (producto) {
            this.carrito = this.carrito.filter(item => item.id !== id);
            this.guardarCarrito();
            this.actualizarContadorCarrito();
            this.renderizarCarrito();
            this.mostrarNotificacion(`${producto.nombre} eliminado del carrito`);
        }
    }

    // Método para guardar el carrito en localStorage
    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
        // Guardar también el último ID usado
        localStorage.setItem('ultimoId', this.ultimoId.toString());
    }

    // Método para actualizar el contador del carrito
    actualizarContadorCarrito() {
        const contadores = document.querySelectorAll('#contador_carrito, .cart-count');
        const totalItems = this.carrito.reduce((total, item) => total + item.cantidad, 0);
        
        contadores.forEach(contador => {
            if (contador) {
                contador.textContent = totalItems;
                contador.style.display = totalItems > 0 ? 'block' : 'none';
            }
        });
    }

    // Método para mostrar notificaciones
    mostrarNotificacion(mensaje) {
        const notificaciones = document.querySelectorAll('#notificacion, .notification');
        notificaciones.forEach(notificacion => {
            if (notificacion) {
                notificacion.textContent = mensaje;
                notificacion.classList.remove('hidden');
                setTimeout(() => {
                    notificacion.classList.add('hidden');
                }, 3000);
            }
        });
    }

    // Método para renderizar los productos en la página del carrito
    renderizarCarrito() {
        const contenedorProductos = document.querySelector('.productos');
        if (!contenedorProductos) return;

        // Limpiar el contenedor
        contenedorProductos.innerHTML = '';

        // Renderizar cada producto
        this.carrito.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.className = 'product-1';
            productoElement.setAttribute('data-id', producto.id);
            productoElement.innerHTML = `
                <div class="item-image">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="img-tabla">
                    <p class="nomProduct">${producto.nombre}</p>
                </div>
                <p class="item-price" data-price="${producto.precio}">$${producto.precio.toLocaleString()}</p>
                <div class="cantidad-control-btn">
                    <button class="cantidad-btn disminuir-btn">-</button>
                    <input type="text" class="mostrar-cantidad" value="${producto.cantidad}" readonly>
                    <button class="cantidad-btn aumentar-btn">+</button>
                </div>
                <p class="item-total">$${(producto.precio * producto.cantidad).toLocaleString()}</p>
                <button class="remove-item"><i class="bi bi-trash3"></i></button>
            `;
            contenedorProductos.appendChild(productoElement);

            // Agregar eventos para los botones de cantidad
            const botonDisminuir = productoElement.querySelector('.disminuir-btn');
            const botonAumentar = productoElement.querySelector('.aumentar-btn');
            const inputCantidad = productoElement.querySelector('.mostrar-cantidad');
            const botonEliminar = productoElement.querySelector('.remove-item');

            botonDisminuir.addEventListener('click', () => {
                const nuevaCantidad = parseInt(inputCantidad.value) - 1;
                this.actualizarCantidad(producto.id, nuevaCantidad);
            });

            botonAumentar.addEventListener('click', () => {
                const nuevaCantidad = parseInt(inputCantidad.value) + 1;
                this.actualizarCantidad(producto.id, nuevaCantidad);
            });

            botonEliminar.addEventListener('click', () => {
                this.eliminarProducto(producto.id);
            });
        });

        // Actualizar el total
        this.actualizarTotal();
    }

    // Método para actualizar el total del carrito
    actualizarTotal() {
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        
        if (subtotalElement && totalElement) {
            const subtotal = this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
            subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
            totalElement.textContent = `$${subtotal.toLocaleString()}`;
        }
    }

    // Método para vaciar completamente el carrito
    vaciarCarrito() {
        this.carrito = [];
        // Limpiar completamente el localStorage
        localStorage.removeItem('carrito');
        localStorage.removeItem('ultimoId');
        // Actualizar la interfaz
        this.actualizarContadorCarrito();
        this.renderizarCarrito();
        this.mostrarNotificacion('Carrito vaciado');
    }
}

// Crear una instancia global del carrito
const carritoManager = new CarritoManager();

// Función para obtener los datos del producto desde el catálogo
function obtenerProductoCatalogo(boton) {
    const precioTexto = boton.closest('.product').querySelector('.precio').textContent;
    const precio = parseFloat(precioTexto.replace(/[^0-9.]/g, '').replace(/\./g, ''));
    
    const producto = {
        id: boton.getAttribute('id'),
        nombre: boton.closest('.product').querySelector('h3').textContent,
        precio: precio,
        cantidad: parseInt(boton.closest('.product').querySelector('.mostrar-cantidad').value),
        imagen: boton.closest('.product').querySelector('img').src
    };
    return producto;
}

// Función para obtener los datos del producto desde el home
function obtenerProductoHome(boton) {
    const producto = {
        id: boton.getAttribute('data-id'),
        nombre: boton.getAttribute('data-name'),
        precio: parseFloat(boton.getAttribute('data-price')),
        cantidad: parseInt(boton.closest('.product1_dest').querySelector('.quantity').textContent),
        imagen: boton.closest('.product1_dest').querySelector('img').src
    };
    return producto;
}

// Función para inicializar los eventos de los botones de agregar al carrito
function inicializarBotonesAgregar() {
    // Botones del catálogo
    const botonesCatalogo = document.querySelectorAll('.agregar_carrito');
    botonesCatalogo.forEach(boton => {
        boton.addEventListener('click', function() {
            const producto = obtenerProductoCatalogo(this);
            carritoManager.agregarProducto(producto);
        });
    });

    // Botones del home
    const botonesHome = document.querySelectorAll('.agregar-carrito');
    botonesHome.forEach(boton => {
        boton.addEventListener('click', function() {
            const producto = obtenerProductoHome(this);
            carritoManager.agregarProducto(producto);
        });
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar los botones de agregar al carrito
    inicializarBotonesAgregar();
    
    // Si estamos en la página del carrito, renderizar los productos
    if (window.location.pathname.includes('index_carrito.html')) {
        carritoManager.renderizarCarrito();
    }
});

// Evento para confirmar la compra, solo si el botón existe
if (botonConfirmar) {
    botonConfirmar.addEventListener('click', () => {
        // Capturar los detalles de la compra antes de vaciar el carrito
        const compra = capturarDetallesCompra();
        // Vaciar el carrito completamente
        carritoManager.vaciarCarrito();
        // Limpiar la interfaz
        document.querySelector('.productos').innerHTML = '';
        actualizarResumenCarrito();
        actualizarContadorCarrito();
        mostrarNotificacion('La compra ha finalizado, gracias por comprar con nosotros');
        ocultarModalConfirmacion();
        // Mostrar el modal de detalle de venta con los productos comprados
        mostrarDetalleVenta(compra);
    });
} 