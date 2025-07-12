const pool = require('../config/db'); // Importa la conexión a la base de datos desde config/db.js

/**
 * Crea una nueva venta, inserta los detalles en detalles_venta y actualiza las salidas en productos.
 * @param {Object} req - Objeto de la solicitud HTTP con los datos de la venta (usuarioId, productos, total).
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Respuesta JSON con el resultado de la operación (éxito o error).
 */
const crearVenta = async (req, res) => {
  const { usuarioId, productos, total } = req.body;

  try {
    // Validar que los datos requeridos estén presentes y sean válidos
    if (!usuarioId || !productos || !total || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos: usuarioId, productos, o total' });
    }

    // Iniciar una transacción para garantizar consistencia en la base de datos
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Validar el stock de cada producto antes de procesar la venta
      for (const producto of productos) {
        const [rows] = await connection.query(
          'SELECT saldo FROM productos WHERE id_producto = ?',
          [producto.id_producto]
        );
        if (rows.length === 0) {
          throw new Error(`Producto con ID ${producto.id_producto} no encontrado`);
        }
        if (rows[0].saldo < producto.cantidad) {
          throw new Error(`Stock insuficiente para el producto ${producto.id_producto}`);
        }
      }

      // Insertar el registro de la venta en la tabla ventas
      const [result] = await connection.query(
        'INSERT INTO ventas (id_usuario, fecha_venta, estado) VALUES (?, NOW(), ?)',
        [usuarioId, 'Pendiente']
      );
      const id_venta = result.insertId;

      // Insertar los detalles de la venta en detalles_venta y actualizar salidas en productos
      for (const producto of productos) {
        // Insertar detalle de la venta
        await connection.query(
          'INSERT INTO detalles_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [id_venta, producto.id_producto, producto.cantidad, producto.precio_venta]
        );

        // Actualizar el campo salida en la tabla productos
        await connection.query(
          'UPDATE productos SET salida = salida + ? WHERE id_producto = ?',
          [producto.cantidad, producto.id_producto]
        );
      }

      // Confirmar la transacción
      await connection.commit();
      res.json({ success: true, id_venta });
    } catch (error) {
      // Revertir la transacción en caso de error
      await connection.rollback();
      console.error('Error al crear la venta:', error);
      res.status(400).json({ error: 'Error al procesar la venta', detalles: error.message });
    } finally {
      // Liberar la conexión
      connection.release();
    }
  } catch (error) {
    console.error('Error al crear la venta:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalles: error.message });
  }
};

/**
 * Obtiene los detalles de una venta por su ID, incluyendo los productos asociados.
 * @param {Object} req - Objeto de la solicitud HTTP con el ID de la venta en los parámetros.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Respuesta JSON con los detalles de la venta o un mensaje de error.
 */
const obtenerVentaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    // Consultar la venta por su ID
    const [ventaRows] = await pool.query('SELECT * FROM ventas WHERE id_venta = ?', [id]);
    if (ventaRows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    // Obtener los detalles de la venta con el nombre del producto
    const [detallesRows] = await pool.query(
      'SELECT dv.*, p.nombre FROM detalles_venta dv JOIN productos p ON dv.id_producto = p.id_producto WHERE dv.id_venta = ?',
      [id]
    );
    const venta = ventaRows[0];
    venta.detalles = detallesRows;

    res.json(venta);
  } catch (error) {
    console.error('Error al obtener la venta:', error);
    res.status(500).json({ error: 'Error al obtener la venta', detalles: error.message });
  }
};

// Exportar las funciones del controlador
module.exports = {
  crearVenta,
  obtenerVentaPorId,
};