const { Stock, Producto } = require('../config/db'); // Ajusta la ruta según tu estructura de modelos

// Crear un nuevo registro de stock
const crearStock = async (req, res) => {
  try {
    const { stock, stock_minimo, estado, id_producto } = req.body;

    // Validar que el producto exista
    const producto = await Producto.findByPk(id_producto);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar si ya existe un stock para este producto (relación 1:1)
    const stockExistente = await Stock.findOne({ where: { id_producto } });
    if (stockExistente) {
      return res.status(400).json({ error: 'Ya existe un stock para este producto' });
    }

    // Crear el stock
    const nuevoStock = await Stock.create({
      stock,
      stock_minimo: stock_minimo || 0,
      estado: estado || 'disponible',
      id_producto,
    });

    return res.status(201).json(nuevoStock);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear el stock' });
  }
};

// Obtener todos los stocks
const obtenerStocks = async (req, res) => {
  try {
    const stocks = await Stock.findAll({
      include: [{ model: Producto, attributes: ['nombre', 'id_categoria'] }],
    });
    return res.status(200).json(stocks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener los stocks' });
  }
};

// Obtener un stock por ID
const obtenerStockPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await Stock.findByPk(id, {
      include: [{ model: Producto, attributes: ['nombre', 'id_categoria'] }],
    });
    if (!stock) {
      return res.status(404).json({ error: 'Stock no encontrado' });
    }
    return res.status(200).json(stock);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el stock' });
  }
};

// Actualizar un stock
const actualizarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, stock_minimo, estado } = req.body;

    const stockExistente = await Stock.findByPk(id);
    if (!stockExistente) {
      return res.status(404).json({ error: 'Stock no encontrado' });
    }

    // Actualizar los campos proporcionados
    await stockExistente.update({
      stock: stock !== undefined ? stock : stockExistente.stock,
      stock_minimo: stock_minimo !== undefined ? stock_minimo : stockExistente.stock_minimo,
      estado: estado || stockExistente.estado,
      fecha_actualizacion: new Date(),
    });

    return res.status(200).json(stockExistente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al actualizar el stock' });
  }
};

// Eliminar un stock
const eliminarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({ error: 'Stock no encontrado' });
    }

    await stock.destroy();
    return res.status(204).send(); // 204 No Content para eliminación exitosa
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al eliminar el stock' });
  }
};

module.exports = {
  crearStock,
  obtenerStocks,
  obtenerStockPorId,
  actualizarStock,
  eliminarStock,
};