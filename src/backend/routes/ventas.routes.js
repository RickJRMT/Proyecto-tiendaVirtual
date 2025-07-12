const express = require('express'); // Importa el módulo Express para crear rutas
const router = express.Router(); // Crea un enrutador de Express
const ventasController = require('../controllers/ventas.controller'); // Importa el controlador de ventas

// Ruta para crear una nueva venta
router.post('/', ventasController.crearVenta);

// Ruta para obtener los detalles de una venta por su ID
router.get('/:id', ventasController.obtenerVentaPorId);

// Exportar el enrutador
module.exports = router;