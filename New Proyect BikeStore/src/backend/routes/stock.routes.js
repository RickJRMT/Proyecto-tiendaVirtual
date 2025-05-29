const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');

// Rutas para la gestión de stocks
router.post('/', stockController.crearStock); // Crear un nuevo stock
router.get('/', stockController.obtenerStocks); // Obtener todos los stocks
router.get('/:id', stockController.obtenerStockPorId); // Obtener un stock por ID
router.put('/:id', stockController.actualizarStock); // Actualizar un stock
router.delete('/:id', stockController.eliminarStock); // Eliminar un stock

module.exports = router;