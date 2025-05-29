const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta para registrar un nuevo usuario
router.post('/registro', async (req, res) => {
    try {
        console.log('Datos recibidos en /auth/registro:', req.body);
        const resultado = await authController.registrar(req, res);
        res.json(resultado);
    } catch (error) {
        console.error('Error en ruta de registro: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar el usuario'
        });
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    try {
        console.log('Datos recibidos en /auth/login:', req.body);
        const resultado = await authController.iniciarSesion(req, res);
        res.json(resultado);
    } catch (error) {
        console.error('Error en ruta de login: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión'
        });
    }
});

// Ruta para verificar si un usuario está autenticado
router.get('/verificar/:id', async (req, res) => {
    try {
        console.log('Verificando usuario con ID:', req.params.id);
        const resultado = await authController.verificarUsuario(req.params.id);
        res.json(resultado);
    } catch (error) {
        console.error('Error al verificar usuario: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar el usuario'
        });
    }
});

module.exports = router;