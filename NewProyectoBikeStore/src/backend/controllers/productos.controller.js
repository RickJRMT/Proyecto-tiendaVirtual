const pool = require('../config/db'); // Importa la conexión a la base de datos desde config/db.js

/**
 * Crea un nuevo producto en la base de datos.
 * @param {Object} req - Objeto de la solicitud HTTP con los datos del producto.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Respuesta JSON con el producto creado o un mensaje de error.
 */
const crearProducto = async (req, res) => {
  try {
    const { nombre, precio_venta, descripcion, entrada, salida } = req.body;

    // Validar campos requeridos
    if (!nombre || !precio_venta) {
      return res.status(400).json({ error: 'El nombre y el precio de venta son requeridos' });
    }

    // Insertar el producto en la base de datos
    const [result] = await pool.execute(
      'INSERT INTO productos (nombre, precio_venta, descripcion, entrada, salida) VALUES (?, ?, ?, ?, ?)',
      [nombre, precio_venta, descripcion || null, entrada || 0, salida || 0]
    );

    // Obtener el producto recién creado
    const idProducto = result.insertId;
    const [nuevoProductoRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [idProducto]
    );
    const producto = nuevoProductoRows[0];

    return res.status(201).json(producto);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    return res.status(500).json({ error: 'Error al crear el producto', detalles: error.message });
  }
};

/**
 * Obtiene todos los productos de la base de datos.
 * @param {Object} req - Objeto de la solicitud HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Respuesta JSON con la lista de productos o un mensaje de error.
 */
const obtenerProductos = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM productos');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    return res.status(500).json({ error: 'Error al obtener los productos', detalles: error.message });
  }
};

/**
 * Obtiene un producto por su ID.
 * @param {Object} req - Objeto de la solicitud HTTP con el ID del producto en los parámetros.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Respuesta JSON con el producto o un mensaje de error.
 */
const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM productos WHERE id_producto = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    return res.status(500).json({ error: 'Error al obtener el producto', detalles: error.message });
  }
};

/**
 * Actualiza un producto existente.
 * @param {Object} req - Objeto de la solicitud HTTP con el ID y los datos actualizados.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Respuesta JSON con el producto actualizado o un mensaje de error.
 */
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio_venta, descripcion, entrada, salida } = req.body;

    // Verificar si el producto existe
    const [productoExistenteRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id]
    );
    if (productoExistenteRows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Validar datos numéricos
    const precio_venta_val = precio_venta !== undefined ? parseFloat(precio_venta) : productoExistenteRows[0].precio_venta;
    const entrada_val = entrada !== undefined ? parseInt(entrada) : productoExistenteRows[0].entrada;
    const salida_val = salida !== undefined ? parseInt(salida) : productoExistenteRows[0].salida;

    if (isNaN(precio_venta_val) || precio_venta_val < 0) {
      return res.status(400).json({ error: 'Precio de venta inválido' });
    }
    if (isNaN(entrada_val) || entrada_val < 0) {
      return res.status(400).json({ error: 'Entrada inválida' });
    }
    if (isNaN(salida_val) || salida_val < 0) {
      return res.status(400).json({ error: 'Salida inválida' });
    }

    // Actualizar el producto
    await pool.execute(
      'UPDATE productos SET nombre = ?, precio_venta = ?, descripcion = ?, entrada = ?, salida = ? WHERE id_producto = ?',
      [
        nombre || productoExistenteRows[0].nombre,
        precio_venta_val,
        descripcion || productoExistenteRows[0].descripcion,
        entrada_val,
        salida_val,
        id,
      ]
    );

    // Obtener el producto actualizado
    const [updatedProductoRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id]
    );
    return res.status(200).json(updatedProductoRows[0]);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    return res.status(500).json({ error: 'Error al actualizar el producto', detalles: error.message });
  }
};

/**
 * Desactiva un producto (eliminación lógica).
 * @param {Object} req - Objeto de la solicitud HTTP con el ID del producto.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Respuesta JSON con un mensaje de éxito o error.
 */
const desactivarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [productoRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id]
    );
    if (productoRows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await pool.execute('DELETE FROM productos WHERE id_producto = ?', [id]);
    return res.status(200).json({ message: 'Producto desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar el producto:', error);
    return res.status(500).json({ error: 'Error al desactivar el producto', detalles: error.message });
  }
};

// Exportar las funciones del controlador
module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  desactivarProducto,
};