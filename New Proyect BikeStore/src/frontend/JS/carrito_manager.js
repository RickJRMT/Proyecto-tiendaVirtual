class CarritoManager {
    constructor() {
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.actualizarContadorCarrito();
        this.ultimoId = Math.max(...this.carrito.map(item => parseInt(item.id) || 0), 0);
    }

    generarIdUnico() {
        this.ultimoId++;
        return this.ultimoId.toString();
    }

    agregarProducto(producto) {
        if (!producto.id) {
            producto.id = this.generarIdUnico();
        }

        const productoExistente = this.carrito.find(item =>
            item.id_producto === producto.id_producto
        );

        if (productoExistente) {
            productoExistente.cantidad += producto.cantidad;
            this.mostrarNotificacion(`Se actualizó la cantidad de ${producto.nombre} a ${productoExistente.cantidad}`);
        } else {
            this.carrito.push(producto);
            this.mostrarNotificacion(`Se agregó ${producto.nombre} al carrito`);
        }

        this.guardarCarrito();
        this.actualizarContadorCarrito();
    }

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

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
        localStorage.setItem('ultimoId', this.ultimoId.toString());
    }

    actualizarContadorCarrito() {
        const contadores = document.querySelectorAll('#contador_carrito, .cart-count');
        const totalItems = this.carrito.reduce((total, item) => total + item.cantidad, 0);

        contadores.forEach(contador => {
            if (contador) {
                contador.textContent = totalItems;
                contador.classList.toggle('hidden', totalItems === 0);
            }
        });
    }

    mostrarNotificacion(mensaje) {
        const notificaciones = document.querySelectorAll('#notificacion, .notification');
        notificaciones.forEach(notificacion => {
            if (notificacion) {
                notificacion.textContent = mensaje;
                notificacion.classList.remove('hidden');
                notificacion.classList.add('mostrar');
                setTimeout(() => {
                    notificacion.classList.remove('mostrar');
                    notificacion.classList.add('hidden');
                }, 3000);
            }
        });
    }

    renderizarCarrito() {
        const contenedorProductos = document.querySelector('.productos');
        if (!contenedorProductos) return;

        contenedorProductos.innerHTML = '';

        this.carrito.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.className = 'product-1';
            productoElement.setAttribute('data-id', producto.id);
            productoElement.innerHTML = `
                <div class="item-image">
                    <img src="${producto.imagen || 'https://via.placeholder.com/120x80?text=Sin+imagen'}" alt="${producto.nombre}" class="img-tabla">
                    <p class="nomProduct">${producto.nombre}</p>
                </div>
                <p class="item-price" data-price="${producto.precio}">$${producto.precio.toLocaleString('es-CO')}</p>
                <div class="cantidad-control-btn">
                    <button class="cantidad-btn disminuir-btn">-</button>
                    <input type="text" class="mostrar-cantidad" value="${producto.cantidad}" readonly>
                    <button class="cantidad-btn aumentar-btn">+</button>
                </div>
                <p class="item-total">$${(producto.precio * producto.cantidad).toLocaleString('es-CO')}</p>
                <button class="remove-item"><i class="bi bi-trash3"></i></button>
            `;
            contenedorProductos.appendChild(productoElement);

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

        this.actualizarTotal();
    }

    actualizarTotal() {
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');

        if (subtotalElement && totalElement) {
            const subtotal = this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
            subtotalElement.textContent = `$${subtotal.toLocaleString('es-CO')}`;
            totalElement.textContent = `$${subtotal.toLocaleString('es-CO')}`;
        }
    }

    vaciarCarrito() {
        this.carrito = [];
        localStorage.removeItem('carrito');
        localStorage.removeItem('ultimoId');
        this.actualizarContadorCarrito();
        this.renderizarCarrito();
        this.mostrarNotificacion('Carrito vaciado');
    }
}

const carritoManager = new CarritoManager();

function obtenerProductoCatalogo(boton) {
    const precioTexto = boton.closest('.product').querySelector('.precio').textContent;
    const precio = parseFloat(precioTexto.replace(/[^0-9.]/g, '').replace(/\./g, ''));

    return {
        id_producto: boton.getAttribute('data-id'),
        nombre: boton.closest('.product').querySelector('h3').textContent,
        precio: precio,
        cantidad: parseInt(boton.closest('.product').querySelector('.mostrar-cantidad').value),
        imagen: boton.closest('.product').querySelector('img').src
    };
}

function obtenerProductoHome(boton) {
    return {
        id_producto: boton.getAttribute('data-id'),
        nombre: boton.getAttribute('data-name'),
        precio: parseFloat(boton.getAttribute('data-price')),
        cantidad: parseInt(boton.closest('.product1_dest').querySelector('.quantity').textContent),
        imagen: boton.closest('.product1_dest').querySelector('img').src
    };
}

function inicializarBotonesAgregar() {
    const botonesCatalogo = document.querySelectorAll('.agregar_carrito');
    botonesCatalogo.forEach(boton => {
        boton.addEventListener('click', function() {
            const producto = obtenerProductoCatalogo(this);
            carritoManager.agregarProducto(producto);
        });
    });

    const botonesHome = document.querySelectorAll('.agregar-carrito');
    botonesHome.forEach(boton => {
        boton.addEventListener('click', function() {
            const producto = obtenerProductoHome(this);
            carritoManager.agregarProducto(producto);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarBotonesAgregar();
    if (window.location.pathname.includes('index_carrito.html')) {
        carritoManager.renderizarCarrito();
    }
});