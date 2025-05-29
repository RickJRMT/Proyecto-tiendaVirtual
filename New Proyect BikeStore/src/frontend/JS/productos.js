document.addEventListener('DOMContentLoaded', function() {
    const productoModal = document.getElementById('productoModal');
    const productoForm = document.getElementById('productoForm');
    const addProductBtn = document.getElementById('addProductBtn');
    const tableBody = document.getElementById('productosTableBody');
    const modalTitle = document.getElementById('modalTitle');
    const searchInput = document.getElementById('searchProduct');
    const productoIdInput = document.getElementById('productoId');

    // Función para cargar productos
    async function cargarProductos() {
        try {
            // Mostrar indicador de carga
            const tableBody = document.getElementById('productosTableBody');
            tableBody.innerHTML = '<tr><td colspan="8" class="loading">Cargando productos...</td></tr>';

            const response = await fetch('http://localhost:3000/api/producto');
            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }
            
            const productos = await response.json();
            mostrarProductos(productos);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            mostrarNotificacion('Error al cargar los productos', 'error');
            const tableBody = document.getElementById('productosTableBody');
            tableBody.innerHTML = '<tr><td colspan="8" class="error">Error al cargar los productos</td></tr>';
        }
    }

    // Función para mostrar productos en la tabla
    function mostrarProductos(productos) {
        tableBody.innerHTML = '';
        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.id_producto}</td>
                <td>${producto.nombre_producto}</td>
                <td>${producto.detalle_producto}</td>
                <td>$${producto.precio_compra.toLocaleString()}</td>
                <td>$${producto.precio_venta.toLocaleString()}</td>
                <td>${obtenerNombreCategoria(producto.categoria_id)}</td>
                <td>${producto.stock}</td>
                <td>${producto.impuesto}%</td>
                <td>
                    <button class="edit_btn" data-id="${producto.id_producto}">Editar</button>
                    <button class="delete_btn" data-id="${producto.id_producto}">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Función para obtener el nombre de la categoría
    function obtenerNombreCategoria(categoriaId) {
        const categorias = {
            1: 'Bicicletas de Montaña',
            2: 'Bicicletas de Ruta',
            3: 'Accesorios',
            4: 'Repuestos',
            5: 'Ropa Ciclista'
        };
        return categorias[categoriaId] || 'Desconocida';
    }

    // Función para abrir el modal
    async function abrirModal(productoId = null) {
        if (productoId) {
            modalTitle.textContent = 'Editar Producto';
            try {
                const response = await fetch(`http://localhost:3000/api/producto/${productoId}`);
                const producto = await response.json();
                
                productoIdInput.value = producto.id_producto;
                document.getElementById('nombre_producto').value = producto.nombre_producto;
                document.getElementById('detalle_producto').value = producto.detalle_producto;
                document.getElementById('precio_compra').value = producto.precio_compra;
                document.getElementById('precio_venta').value = producto.precio_venta;
                document.getElementById('categoria').value = producto.categoria_id;
                document.getElementById('impuesto').value = producto.impuesto;
            } catch (error) {
                console.error('Error al cargar producto:', error);
                alert('Error al cargar el producto');
            }
        } else {
            modalTitle.textContent = 'Agregar Nuevo Producto';
            productoIdInput.value = '';
            productoForm.reset();
        }
        productoModal.classList.add('active');
    }

    // Función para cerrar el modal
    function cerrarModal() {
        productoModal.classList.remove('active');
        productoForm.reset();
    }

    // Event listeners
    addProductBtn.addEventListener('click', () => abrirModal());

    document.querySelector('.close_modal').addEventListener('click', cerrarModal);
    document.querySelector('.btn_cancelar').addEventListener('click', cerrarModal);

    // Manejar el envío del formulario
    productoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(productoForm);
        const data = {
            nombre_producto: formData.get('nombre_producto'),
            detalle_producto: formData.get('detalle_producto'),
            precio_compra: parseFloat(formData.get('precio_compra')),
            precio_venta: parseFloat(formData.get('precio_venta')),
            categoria_id: parseInt(formData.get('categoria_id')),
            impuesto: parseFloat(formData.get('impuesto'))
        };
        const productoId = productoIdInput.value;

        try {
            const url = productoId ? `http://localhost:3000/api/producto/${productoId}` : 'http://localhost:3000/api/producto';
            const method = productoId ? 'PUT' : 'POST';

            // Mostrar indicador de carga
            const submitBtn = productoForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Cerrar el modal primero
                cerrarModal();
                
                // Mostrar notificación de éxito
                mostrarNotificacion(
                    productoId ? 'Producto actualizado exitosamente' : 'Producto agregado exitosamente',
                    'success'
                );
                
                // Recargar la tabla de productos
                await cargarProductos();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la operación');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion(error.message || 'Error al guardar el producto', 'error');
        } finally {
            // Restaurar el botón de submit
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });

    // Manejar clic en botones de editar y eliminar
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit_btn')) {
            const id = e.target.dataset.id;
            await abrirModal(id);
        } else if (e.target.classList.contains('delete_btn')) {
            const id = e.target.dataset.id;
            const nombreProducto = e.target.closest('tr').querySelector('td:nth-child(2)').textContent;
            
            // Crear modal de confirmación
            const confirmacion = document.createElement('div');
            confirmacion.className = 'modal confirmacion_modal';
            confirmacion.innerHTML = `
                <div class="modal_content">
                    <div class="modal_header">
                        <h3>Confirmar Eliminación</h3>
                        <span class="close_modal">&times;</span>
                    </div>
                    <div class="modal_body">
                        <p>¿Estás seguro de que deseas eliminar el producto "${nombreProducto}"?</p>
                        <p class="warning">Esta acción no se puede deshacer.</p>
                    </div>
                    <div class="modal_footer">
                        <button class="btn_cancelar">Cancelar</button>
                        <button class="btn_eliminar">Eliminar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(confirmacion);
            confirmacion.classList.add('active');
            
            // Eventos del modal de confirmación
            const closeModal = () => {
                confirmacion.classList.remove('active');
                setTimeout(() => confirmacion.remove(), 300);
            };
            
            confirmacion.querySelector('.close_modal').addEventListener('click', closeModal);
            confirmacion.querySelector('.btn_cancelar').addEventListener('click', closeModal);
            
            confirmacion.querySelector('.btn_eliminar').addEventListener('click', async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/producto/${id}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        cargarProductos();
                        mostrarNotificacion('Producto eliminado exitosamente', 'success');
                    } else {
                        throw new Error('Error al eliminar el producto');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    mostrarNotificacion('Error al eliminar el producto', 'error');
                } finally {
                    closeModal();
                }
            });
        }
    });

    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.textContent = mensaje;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }

    // Búsqueda de productos
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        try {
            const response = await fetch('http://localhost:3000/api/producto');
            const productos = await response.json();
            const filteredProductos = productos.filter(producto => 
                producto.nombre_producto.toLowerCase().includes(searchTerm) ||
                producto.detalle_producto.toLowerCase().includes(searchTerm)
            );
            mostrarProductos(filteredProductos);
        } catch (error) {
            console.error('Error en la búsqueda:', error);
        }
    });

    // Cargar productos al iniciar
    cargarProductos();
}); 