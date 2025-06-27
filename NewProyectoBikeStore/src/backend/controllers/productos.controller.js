const pool = require('../config/db'); // Asegúrate de que la ruta apunte a tu archivo db.js

// Crear un nuevo producto
const crearProducto = async (req, res) => {
  try {
    const { nombre, precio_venta, descripcion, imagen, entrada, salida } = req.body;

    // Validar que los datos requeridos estén presentes
    if (!nombre || !precio_venta) {
      return res.status(400).json({ error: 'El nombre y el precio de venta son requeridos' });
    }

    // Insertar el nuevo producto (saldo se calcula automáticamente)
    const [result] = await pool.execute(
      'INSERT INTO productos (nombre, precio_venta, descripcion, imagen, entrada, salida) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, precio_venta, descripcion || null, imagen || null, entrada || 0, salida || 0]
    );

    // Obtener el producto recién creado
    const [nuevoProductoRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [result.insertId]
    );

    return res.status(201).json(nuevoProductoRows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear el producto', detalles: error.message });
  }
};

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM productos');
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener los productos', detalles: error.message });
  }
};

// Obtener un producto por ID
const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM productos WHERE id_producto = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el producto', detalles: error.message });
  }
};

// Actualizar un producto (incluyendo entrada y salida)
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio_venta, descripcion, imagen, entrada, salida } = req.body;

    const [productoExistenteRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id]
    );
    if (productoExistenteRows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await pool.execute(
      'UPDATE productos SET nombre = ?, precio_venta = ?, descripcion = ?, imagen = ?, entrada = ?, salida = ? WHERE id_producto = ?',
      [
        nombre || productoExistenteRows[0].nombre,
        precio_venta !== undefined ? precio_venta : productoExistenteRows[0].precio_venta,
        descripcion || productoExistenteRows[0].descripcion,
        imagen || productoExistenteRows[0].imagen,
        entrada !== undefined ? entrada : productoExistenteRows[0].entrada,
        salida !== undefined ? salida : productoExistenteRows[0].salida,
        id,
      ]
    );

    const [updatedProductoRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id]
    );

    return res.status(200).json(updatedProductoRows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al actualizar el producto', detalles: error.message });
  }
};

// Eliminar un producto
const eliminarProducto = async (req, res) => {
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
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al eliminar el producto', detalles: error.message });
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
};