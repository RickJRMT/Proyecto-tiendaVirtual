const bcrypt = require('bcrypt');
const pool = require('../config/db');

class AuthController {
    static async registrar(req, res) {
        try {
            const { nombre, apellido, telefono, direccion, correo, clave, rol } = req.body;

            // Validar que los campos requeridos estén presentes
            if (!nombre || !apellido || !telefono || !direccion || !correo || !clave || !rol) {
                console.log('Datos incompletos:', req.body);
                return { success: false, message: 'Todos los campos son requeridos' };
            }

            console.log('Datos recibidos para registrar:', req.body);

            // Cifrar la contraseña
            const saltRounds = 10;
            console.log('Cifrando contraseña...');
            const hashedClave = await bcrypt.hash(clave, saltRounds);
            console.log('Contraseña cifrada:', hashedClave);

            // Guardar el usuario en la base de datos
            console.log('Ejecutando consulta SQL para insertar usuario...');
            const [result] = await pool.query(
                'INSERT INTO usuarios (nombre, apellido, telefono, direccion, correo, clave, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [nombre, apellido, telefono, direccion, correo, hashedClave, rol]
            );

            console.log('Usuario registrado con ID:', result.insertId);

            return { success: true, usuarioId: result.insertId };
        } catch (error) {
            console.error('Error en registrar:', error);
            throw error; // Lanzamos el error para que la ruta lo capture
        }
    }

    static async iniciarSesion(req, res) {
        try {
            const { correo, clave } = req.body;

            if (!correo || !clave) {
                return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos' });
            }

            const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
            const usuario = rows[0];

            if (!usuario) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            if (!usuario.clave) {
                return res.status(500).json({ success: false, message: 'Contraseña no configurada para este usuario' });
            }

            const contraseñaValida = await bcrypt.compare(clave, usuario.clave);
            if (!contraseñaValida) {
                return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
            }

            // Enviar la respuesta correctamente al frontend
            return res.json({
                success: true,
                usuarioId: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                rol: usuario.rol
            });
        } catch (error) {
            console.error('Error en iniciarSesion:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }

    static async verificarUsuario(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id]);
            const usuario = rows[0];

            if (!usuario) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            return {
                success: true,
                usuarioId: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                rol: usuario.rol
            };
        } catch (error) {
            console.error('Error en verificarUsuario:', error);
            throw error;
        }
    }
}

module.exports = AuthController;