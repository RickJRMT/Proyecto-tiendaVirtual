// Importar el módulo express
const express = require('express');

// Crear un nuevo router de Express para manejar rutas de manera modular
const router = express.Router();

// Importar el controlador genérico para operaciones CRUD
const CrudController = require('../controllers/crud.controller');

// Instanciar una nueva instancia del controlador para usar sus métodos
const crud = new CrudController();

// Definir el nombre de la tabla en la base de datos sobre la cual se operará
const tabla = 'usuarios';

// Definir el nombre del campo identificador único de la tabla
const idCampo = 'id_usuario';

// Ruta para obtener todos los registros de usuarios
router.get('/', async (req, res) => {
    try {
        // Utilizar el método obtenerTodos del controlador para traer todos los registros
        const usuarios = await crud.obtenerTodo(tabla);

        // Respuesta con el arreglo de usuarios en formato JSON
        res.json(usuarios);
    } catch (error) {
        // Si hay un error, se responde con código 500 y el mensaje del error
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener una usuario específica por su ID
router.get('/:id', async (req, res) => {
    try {
        // Utilizar el método obtenerUno con el ID recibido en la URL
        const usuario = await crud.obtenerUno(tabla, idCampo, req.params.id);

        // Respuesta con datos de la usuario en formato JSON
        res.json(usuario);
    } catch (error) {
        // Manejar errores de servidor
        res.status(500).json({ error: error.message });
    }
});

// Ruta para crear una nueva usuario (registro nuevo en la base de datos)
router.post('/', async (req, res) => {
    try {
        // Utilizar el método crear con los datos enviados en el cuerpo del resquest
        const nuevausuario = await crud.crear(tabla, req.body);

        // Respuesta con el nuevo registro creado y código 201 (creado)
        res.status(201).json(nuevausuario);
    } catch (error) {
        // Manejar errores de servidor
        res.status(500).json({ error: error.message });
    }
});

// Ruta para actualizar una usuario existente (por ID)
router.put('/:id', async (req, res) => {
    try {
        // Utilizar el método actualizar con el ID y los nuevos datos del cuerpo
        const usuarioActualizada = await crud.actualizar(tabla, idCampo, req.params.id, req.body);

        // Respuesta con el registro actualizado
        res.json(usuarioActualizada);
    } catch (error) {
        // Manejar errores de servidor
        res.status(500).json({ error: error.message });
    }
});

// Ruta para eliminar una usuario de la base de datos (por ID)}
router.delete('/:id', async (req, res) => {
    try {
        // Utilizar el método eliminar con el ID recibido
        const resultado = await crud.eliminar(tabla, idCampo, req.params.id);

        // Respuesta con un mensaje o confirmacion de eliminación
        res.json(resultado);
    } catch (error) {
        // Manejar errores de servidor
        res.status(500).json({ error: error.message });
    }
});

// Exportar el router para que pueda ser usado en la aplicacion principal
module.exports = router;