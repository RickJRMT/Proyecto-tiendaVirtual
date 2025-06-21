document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const sidebarItems = document.querySelectorAll('.sidebar nav ul li');
    const contentSections = document.querySelectorAll('.content_section');
    const menuToggle = document.querySelector('.menu_toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    
    // Modal de productos - elementos
    const productoModal = document.getElementById('productoModal');
    const addProductBtn = document.querySelector('#productos .add_btn');
    const closeModal = document.querySelector('.close_modal');
    const btnCancelar = document.querySelector('.btn_cancelar');
    const productoForm = document.getElementById('productoForm');

    // Función para cambiar de sección
    function changeSection(sectionId) {
        // Ocultar todas las secciones
        contentSections.forEach(section => {
            section.classList.remove('active');
        });

        // Desactivar todos los items del menú
        sidebarItems.forEach(item => {
            item.classList.remove('active');
        });

        // Mostrar la sección seleccionada
        document.getElementById(sectionId).classList.add('active');

        // Activar el item del menú correspondiente
        const activeItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // En móvil, cerrar el menú después de seleccionar
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }
    }

    // Event listeners para los items del menú
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            changeSection(sectionId);
        });
    });

    // Toggle del menú en móvil
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer clic en el overlay
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Cerrar menú al redimensionar la ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }
    });

    // Inicializar gráficos (usando Chart.js)
    if (typeof Chart !== 'undefined') {
        // Gráfico de ventas
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            new Chart(salesCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Ventas',
                        data: [12000, 19000, 15000, 25000, 22000, 30000],
                        borderColor: '#c11000',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Gráfico de productos más vendidos
        const productsCtx = document.getElementById('productsChart');
        if (productsCtx) {
            new Chart(productsCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['MTB', 'Ruta', 'Urbana', 'BMX', 'Eléctrica'],
                    datasets: [{
                        label: 'Unidades Vendidas',
                        data: [65, 59, 80, 81, 56],
                        backgroundColor: '#c11000'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    // Funcionalidad para los botones de acción
    document.querySelectorAll('.edit_btn').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Editar elemento');
        });
    });

    document.querySelectorAll('.delete_btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
                console.log('Eliminar elemento');
            }
        });
    });

    // Funcionalidad del modal de productos
    
    // Función para abrir el modal
    function abrirModal() {
        productoModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Previene el scroll del body
    }

    // Función para cerrar el modal
    function cerrarModal() {
        productoModal.classList.remove('active');
        document.body.style.overflow = ''; // Restaura el scroll
        productoForm.reset(); // Limpia el formulario
    }

    // Event listeners para el modal
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModal();
        });
    } else {
        console.warn('Botón de agregar producto no encontrado');
    }

    if (closeModal) {
        closeModal.addEventListener('click', cerrarModal);
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', cerrarModal);
    }

    // Cerrar modal al hacer click fuera del contenido
    if (productoModal) {
        productoModal.addEventListener('click', (e) => {
            if (e.target === productoModal) {
                cerrarModal();
            }
        });
    }
})