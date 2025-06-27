const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productos.controller'); // Corregido a 'productos.controller'

// Rutas para la gestión de productos
router.post('/', productoController.crearProducto); // Crear un nuevo producto
router.get('/', productoController.obtenerProductos); // Obtener todos los productos
router.get('/:id', productoController.obtenerProductoPorId); // Obtener un producto por ID
router.put('/:id', productoController.actualizarProducto); // Actualizar un producto
router.delete('/:id', productoController.eliminarProducto); // Eliminar un producto

module.exports = router;