const express = require('express'); // Importa el módulo Express
const router = express.Router(); // Crea un enrutador de Express
const productoController = require('../controllers/productos.controller'); // Importa el controlador de productos

// Rutas para la gestión de productos
router.post('/', productoController.crearProducto); // Crear un nuevo producto
router.get('/', productoController.obtenerProductos); // Obtener todos los productos
router.get('/:id', productoController.obtenerProductoPorId); // Obtener un producto por ID
router.put('/:id', productoController.actualizarProducto); // Actualizar un producto
router.delete('/:id', productoController.desactivarProducto); // Desactivar un producto

// Exportar el enrutador
module.exports = router;