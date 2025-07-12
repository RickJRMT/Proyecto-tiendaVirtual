const db = require('../config/db');
const bcrypt = require('bcrypt');

// Se crea una clase llamada CrudController que manejará todas las operaciones CRUD
class CrudController {

    // Método para obtener todos los registros de una tabla
    async obtenerTodo(tabla) {
        try {
            const [resultados] = await db.query(`SELECT * FROM ${tabla}`);
            return resultados;
        } catch (error) {
            throw error;
        }
    }

    // Método para obtener un único registro por su ID
    async obtenerUno(tabla, idCampo, id) {
        try {
            const [resultado] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, idCampo, id]);
            return resultado[0];
        } catch (error) {
            throw error;
        }
    }

    // Método para crear un nuevo registro
    async crear(tabla, data) {
        try {
            const [resultado] = await db.query(`INSERT INTO ?? SET ?`, [tabla, data]);
            return { ...data, id: resultado.insertId };
        } catch (error) {
            throw error;
        }
    }

    // Método para actualizar un registro existente
    async actualizar(tabla, idCampo, id, data) {
        try {
            let dataToUpdate = { ...data };

            // Si la tabla es 'usuarios' y se proporciona 'clave', hashearla
            if (tabla === 'usuarios' && data.clave) {
                const saltRounds = 10;
                dataToUpdate.clave = await bcrypt.hash(data.clave, saltRounds);
                console.log('Contraseña hasheada para actualización:', dataToUpdate.clave);
            }

            const [resultado] = await db.query(`UPDATE ?? SET ? WHERE ?? = ?`, [tabla, dataToUpdate, idCampo, id]);
            if (resultado.affectedRows === 0) {
                throw new Error('Registro no encontrado');
            }
            return await this.obtenerUno(tabla, idCampo, id);
        } catch (error) {
            throw error;
        }
    }

    // Método para eliminar un registro
    async eliminar(tabla, idCampo, id) {
        try {
            const [resultado] = await db.query(`DELETE FROM ?? WHERE ?? = ?`, [tabla, idCampo, id]);
            if (resultado.affectedRows === 0) {
                throw new Error('Registro no encontrado');
            }
            return { mensaje: 'Registro eliminado correctamente' };
        } catch (error) {
            throw error;
        }
    }
}

// Se exporta la clase para poder utilizarla en otros archivos
module.exports = CrudController;