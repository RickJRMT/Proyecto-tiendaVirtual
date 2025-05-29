document.addEventListener('DOMContentLoaded', () => {
    // Selecciona todos los elementos que hay en el carrito
    const productosCarrito = document.querySelectorAll('.product-1');
    const elementoSubtotal = document.getElementById('subtotal');
    const elementoTotal = document.getElementById('total');
    const contadorCarrito = document.getElementById('contador_carrito');
    const botonIniciarCompra = document.getElementById('iniciar-compra');
    const confirmacionModal = document.getElementById('confirmacion-modal');
    const notificacion = document.getElementById('notificacion');
    // Seleccionar el modal o recuadro de detalle de venta
    const detalleVentaModal = document.getElementById('detalle-venta-modal');
    const detalleVentaLista = document.getElementById('detalle-venta-lista');
    const cerrarDetalleBtn = detalleVentaModal ? detalleVentaModal.querySelector('.cerrar-detalle-btn') : null;

    // Seleccionar los botones del modal después de asegurarnos de que el modal existe
    let botonConfirmar = null;
    let botonCancelar = null;
    if (confirmacionModal) {
        botonConfirmar = confirmacionModal.querySelector('.confirmar-btn');
        botonCancelar = confirmacionModal.querySelector('.cancelar-btn');
    } else {
        // Banderita para verificar si el modal no se encuentra
        console.error('El elemento confirmacion-modal no se encontró en el DOM.');
    }

    // Esta funcion permite formatear el precio en un formato legible
    const formatearPrecio = (precio) => {
        return '$' + precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Esta funcion permite calcular la cantidad total de productos en el carrito
    const calcularCantidadTotal = () => {
        let cantidadTotal = 0;
        document.querySelectorAll('.product-1').forEach(producto => {
            const cantidad = parseInt(producto.querySelector('.mostrar-cantidad').value) || 0;
            cantidadTotal += cantidad;
        });
        return cantidadTotal;
    };

    // Agregue esta funcion para que quede acorde a dar una noti en burbujita al icono del carrito
    const actualizarContadorCarrito = () => {
        const cantidadTotal = calcularCantidadTotal();
        contadorCarrito.textContent = cantidadTotal;
        if (cantidadTotal === 0) {
            contadorCarrito.classList.add('hidden');
        } else {
            contadorCarrito.classList.remove('hidden');
        }
    };

    // Esta funcion permite actualizar el total de un producto
    const actualizarTotalProducto = (producto) => {
        const cantidad = parseInt(producto.querySelector('.mostrar-cantidad').value) || 0;
        const precioUnitario = parseInt(producto.querySelector('.item-price').getAttribute('data-price')) || 0;
        const total = cantidad * precioUnitario;
        producto.querySelector('.item-total').textContent = formatearPrecio(total);
    };

    // Esta funcion permite actualizar el subtotal y total general que hay en el recuadro de comprar
    const actualizarResumenCarrito = () => {
        let subtotal = 0;
        document.querySelectorAll('.product-1').forEach(producto => {
            const cantidad = parseInt(producto.querySelector('.mostrar-cantidad').value) || 0;
            const precioUnitario = parseInt(producto.querySelector('.item-price').getAttribute('data-price')) || 0;
            subtotal += cantidad * precioUnitario;
        });
        elementoSubtotal.textContent = formatearPrecio(subtotal);
        elementoTotal.textContent = formatearPrecio(subtotal); // El total es igual al subtotal (envío gratis)
    };

    // Aqui la función para mostrar notificaciones
    const mostrarNotificacion = (mensaje) => {
        notificacion.textContent = mensaje;
        notificacion.classList.add('mostrar');
        setTimeout(() => {
            notificacion.classList.remove('mostrar');
        }, 3000); // La notificación desaparece después de 3 segundos
    };

    // Función para mostrar el modal de confirmación
    const mostrarModalConfirmacion = () => {
        if (confirmacionModal) {
            confirmacionModal.classList.add('mostrar');
            // Banderita para confirmar que se intenta mostrar el modal
            console.log('Mostrando el modal de confirmación.');
        } else {
            // Banderita si el modal no existe
            console.error('No se puede mostrar el modal porque confirmacionModal es null.');
        }
    };

    // Función para ocultar el modal de confirmación
    const ocultarModalConfirmacion = () => {
        if (confirmacionModal) {
            confirmacionModal.classList.remove('mostrar');
            // Banderita para confirmar que se oculta el modal
            console.log('Ocultando el modal de confirmación.');
        }
    };

    // Función para capturar los detalles de los productos comprados y el total general
    const capturarDetallesCompra = () => {
        let totalGeneral = 0;
        const detalles = [];
        document.querySelectorAll('.product-1').forEach(producto => {
            const nombre = producto.querySelector('.nomProduct').textContent;
            const precioUnitario = parseInt(producto.querySelector('.item-price').getAttribute('data-price')) || 0;
            const cantidad = parseInt(producto.querySelector('.mostrar-cantidad').value) || 0;
            const total = precioUnitario * cantidad;
            totalGeneral += total;
            detalles.push({
                nombre,
                precioUnitario: formatearPrecio(precioUnitario),
                cantidad,
                total: formatearPrecio(total)
            });
        });
        return { detalles, totalGeneral: formatearPrecio(totalGeneral) };
    };

    // Función para mostrar el modal de detalle de venta
    const mostrarDetalleVenta = (compra) => {
        if (detalleVentaModal && detalleVentaLista) {
            // Limpiar la lista anterior
            detalleVentaLista.innerHTML = '';
            // Añadir cada producto a la lista
            compra.detalles.forEach(detalle => {
                const detalleItem = document.createElement('p');
                detalleItem.textContent =` ${detalle.nombre} - Precio: ${detalle.precioUnitario} - Cantidad: ${detalle.cantidad} - Total: ${detalle.total}`;
                detalleVentaLista.appendChild(detalleItem);
            });
            // Añadir el total general al final
            const totalItem = document.createElement('p');
            totalItem.classList.add('total-general');
            totalItem.textContent = `Total General: ${compra.totalGeneral}`;
            detalleVentaLista.appendChild(totalItem);
            detalleVentaModal.classList.add('mostrar');
            // Banderita para confirmar que se muestra el modal de detalle
            console.log('Mostrando el modal de detalle de venta.');
        } else {
            // Banderita si el modal no existe
            console.error('No se puede mostrar el modal de detalle porque detalleVentaModal o detalleVentaLista es null.');
        }
    };

    // Función para ocultar el modal de detalle de venta
    const ocultarDetalleVenta = () => {
        if (detalleVentaModal) {
            detalleVentaModal.classList.remove('mostrar');
            // Banderita para confirmar que se oculta el modal
            console.log('Ocultando el modal de detalle de venta.');
        }
    };

    // Aqui añadimos eventos a cada producto del carrito
    productosCarrito.forEach(producto => {
        const botonAumentar = producto.querySelector('.aumentar-btn');
        const botonDisminuir = producto.querySelector('.disminuir-btn');
        const entradaCantidad = producto.querySelector('.mostrar-cantidad');
        const botonEliminar = producto.querySelector('.remove-item');

        // Evento para aumentar la cantidad
        if (botonAumentar) {
            botonAumentar.addEventListener('click', () => {
                let cantidad = parseInt(entradaCantidad.value);
                cantidad++;
                entradaCantidad.value = cantidad;
                actualizarTotalProducto(producto);
                actualizarResumenCarrito();
                actualizarContadorCarrito();
            });
        }

        // Evento para disminuir la cantidad
        if (botonDisminuir) {
            botonDisminuir.addEventListener('click', () => {
                let cantidad = parseInt(entradaCantidad.value);
                if (cantidad > 1) {
                    cantidad--;
                    entradaCantidad.value = cantidad;
                    actualizarTotalProducto(producto);
                    actualizarResumenCarrito();
                    actualizarContadorCarrito();
                }
            });
        }

        // Evento para eliminar un producto del carrito
        if (botonEliminar) {
            botonEliminar.addEventListener('click', () => {
                producto.remove();
                actualizarResumenCarrito();
                actualizarContadorCarrito();
                mostrarNotificacion('Producto eliminado');
                console.log(`Producto con ID ${producto.getAttribute('data-id')} eliminado del carrito.`);
            });
        }
    });

    // Evento para mostrar el modal de confirmación al hacer clic en "Finalizar Compra"
    if (botonIniciarCompra) {
        botonIniciarCompra.addEventListener('click', () => {
            // Banderita para confirmar que el evento se dispara
            console.log('Botón Finalizar Compra clickeado.');
            const cantidadTotal = calcularCantidadTotal();
            if (cantidadTotal > 0) {
                mostrarModalConfirmacion();
            } else {
                mostrarNotificacion('El carrito está vacío');
            }
        });
    } else {
        // Banderita para verificar si el botón no se encuentra
        console.error('El elemento iniciar-compra no se encontró en el DOM.');
    }

    // Evento para confirmar la compra, solo si el botón existe
    if (botonConfirmar) {
        botonConfirmar.addEventListener('click', () => {
            // Capturar los detalles de la compra antes de vaciar el carrito
            const compra = capturarDetallesCompra();
            // Vaciar el carrito usando el CarritoManager
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
    } else {
        // Banderita para verificar si el botón no se encuentra
        console.error('El elemento confirmar-btn no se encontró en el DOM.');
    }

    // Evento para cancelar la compra, solo si el botón existe
    if (botonCancelar) {
        botonCancelar.addEventListener('click', () => {
            ocultarModalConfirmacion();
        });
    } else {
        // Banderita para verificar si el botón no se encuentra
        console.error('El elemento cancelar-btn no se encontró en el DOM.');
    }

    // Evento para cerrar el modal de detalle de venta
    if (cerrarDetalleBtn) {
        cerrarDetalleBtn.addEventListener('click', () => {
            ocultarDetalleVenta();
        });
    } else {
        // Banderita para verificar si el botón no se encuentra
        console.error('El elemento cerrar-detalle-btn no se encontró en el DOM.');
    }

    // Aqui inicializa los totales y la burbujita al cargar la página
    productosCarrito.forEach(producto => actualizarTotalProducto(producto));
    actualizarResumenCarrito();
    actualizarContadorCarrito();
});