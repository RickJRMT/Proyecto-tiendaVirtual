const pool = require('../config/db'); // Asegúrate de que la ruta apunte a tu archivo db.js

// Crear un nuevo registro de stock
const crearStock = async (req, res) => {
  try {
    const { stock, stock_minimo, estado, id_producto } = req.body;

    // Validar que el producto exista
    const [productoRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id_producto]
    );
    if (productoRows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar si ya existe un stock para este producto (relación 1:1)
    const [stockExistenteRows] = await pool.execute(
      'SELECT * FROM stocks WHERE id_producto = ?',
      [id_producto]
    );
    if (stockExistenteRows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un stock para este producto' });
    }

    // Crear el stock
    const [result] = await pool.execute(
      'INSERT INTO stocks (stock, stock_minimo, estado, id_producto) VALUES (?, ?, ?, ?)',
      [stock, stock_minimo || 0, estado || 'disponible', id_producto]
    );

    // Obtener el stock recién creado
    const [nuevoStockRows] = await pool.execute(
      'SELECT * FROM stocks WHERE id_stock = ?',
      [result.insertId]
    );

    return res.status(201).json(nuevoStockRows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear el stock', detalles: error.message });
  }
};

// Obtener todos los stocks
const obtenerStocks = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT s.*, p.nombre FROM stocks s LEFT JOIN productos p ON s.id_producto = p.id_producto'
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener los stocks', detalles: error.message });
  }
};

// Obtener un stock por ID
const obtenerStockPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT s.*, p.nombre FROM stocks s LEFT JOIN productos p ON s.id_producto = p.id_producto WHERE s.id_stock = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stock no encontrado' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el stock', detalles: error.message });
  }
};

// Actualizar un stock
const actualizarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, stock_minimo, estado } = req.body;

    const [stockExistenteRows] = await pool.execute(
      'SELECT * FROM stocks WHERE id_stock = ?',
      [id]
    );
    if (stockExistenteRows.length === 0) {
      return res.status(404).json({ error: 'Stock no encontrado' });
    }

    await pool.execute(
      'UPDATE stocks SET stock = ?, stock_minimo = ?, estado = ?, fecha_actualizacion = ? WHERE id_stock = ?',
      [
        stock !== undefined ? stock : stockExistenteRows[0].stock,
        stock_minimo !== undefined ? stock_minimo : stockExistenteRows[0].stock_minimo,
        estado || stockExistenteRows[0].estado,
        new Date().toISOString().replace('T', ' ').substr(0, 19),
        id,
      ]
    );

    const [updatedStockRows] = await pool.execute(
      'SELECT * FROM stocks WHERE id_stock = ?',
      [id]
    );

    return res.status(200).json(updatedStockRows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al actualizar el stock', detalles: error.message });
  }
};

// Eliminar un stock
const eliminarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const [stockRows] = await pool.execute(
      'SELECT * FROM stocks WHERE id_stock = ?',
      [id]
    );
    if (stockRows.length === 0) {
      return res.status(404).json({ error: 'Stock no encontrado' });
    }

    await pool.execute('DELETE FROM stocks WHERE id_stock = ?', [id]);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al eliminar el stock', detalles: error.message });
  }
};

module.exports = {
  crearStock,
  obtenerStocks,
  obtenerStockPorId,
  actualizarStock,
  eliminarStock,
};