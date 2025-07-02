const pool = require('../config/db');
const imagenesController = require('./imagenes.controller');

// Crear un nuevo producto
const crearProducto = async (req, res) => {
  try {
    const { nombre, precio_venta, descripcion, entrada, salida, imagenBase64 } = req.body;

    // Validar que los datos requeridos estén presentes
    if (!nombre || !precio_venta) {
      return res.status(400).json({ error: 'El nombre y el precio de venta son requeridos' });
    }

    // Insertar el nuevo producto
    const [result] = await pool.execute(
      'INSERT INTO productos (nombre, precio_venta, descripcion, entrada, salida) VALUES (?, ?, ?, ?, ?)',
      [nombre, precio_venta, descripcion || null, entrada || 0, salida || 0]
    );

    const idProducto = result.insertId;

    // Subir imagen si se proporciona
    if (imagenBase64) {
      const imagenResult = await imagenesController.subirImagen('productos', 'id_producto', idProducto, imagenBase64);
      if (imagenResult.error) {
        return res.status(400).json({ error: imagenResult.error });
      }
    }

    // Obtener el producto recién creado con la imagen
    const [nuevoProductoRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [idProducto]
    );
    let producto = nuevoProductoRows[0];

    if (producto.imagen) {
      const imagenData = await imagenesController.obtenerImagen('productos', 'id_producto', idProducto);
      producto.imagen = imagenData.imagen || null;
    }

    return res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear el producto', detalles: error.message });
  }
};

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM productos');
    const productos = await Promise.all(rows.map(async (producto) => {
      if (producto.imagen) {
        const imagenData = await imagenesController.obtenerImagen('productos', 'id_producto', producto.id_producto);
        producto.imagen = imagenData.imagen || null;
      }
      return producto;
    }));
    return res.status(200).json(productos);
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
    let producto = rows[0];

    if (producto.imagen) {
      const imagenData = await imagenesController.obtenerImagen('productos', 'id_producto', id);
      producto.imagen = imagenData.imagen || null;
    }

    return res.status(200).json(producto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el producto', detalles: error.message });
  }
};

// Actualizar un producto
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio_venta, descripcion, entrada, salida, imagenBase64 } = req.body;

    console.log('Datos recibidos para actualizar:', { id, ...req.body }); // Log de entrada

    const [productoExistenteRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id]
    );
    if (productoExistenteRows.length === 0) {
      console.log('Producto no encontrado con ID:', id);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Validar datos antes de la actualización
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

    // Actualizar la imagen si se proporciona
    if (imagenBase64) {
      console.log('Intentando subir imagen para ID:', id);
      const imagenResult = await imagenesController.subirImagen('productos', 'id_producto', id, imagenBase64);
      if (imagenResult.error) {
        console.log('Error al subir imagen:', imagenResult.error);
        return res.status(400).json({ error: imagenResult.error });
      }
    }

    const [updatedProductoRows] = await pool.execute(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id]
    );
    let producto = updatedProductoRows[0];

    if (producto.imagen) {
      const imagenData = await imagenesController.obtenerImagen('productos', 'id_producto', id);
      producto.imagen = imagenData.imagen || null;
    }

    console.log('Producto actualizado exitosamente:', producto);
    return res.status(200).json(producto);
  } catch (error) {
    console.error('Error detallado al actualizar producto:', error);
    return res.status(500).json({ error: 'Error al actualizar el producto', detalles: error.message });
  }
};

// Desactivar un producto (eliminación lógica)
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

    // Simulación de eliminación lógica (puedes agregar una columna 'activo' si lo prefieres)
    await pool.execute('DELETE FROM productos WHERE id_producto = ?', [id]);
    return res.status(200).json({ message: 'Producto desactivado correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al desactivar el producto', detalles: error.message });
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  desactivarProducto,
};