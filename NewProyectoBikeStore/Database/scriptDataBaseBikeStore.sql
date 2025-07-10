CREATE DATABASE bike_store;
USE bike_store;

-- Tabla: productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL CHECK (precio_venta >= 0),
    descripcion VARCHAR(500),
    imagen LONGBLOB, -- Recordar que el "longblod" solo se coloca para tranformar las imagenes y estas se almacenen en la DB, no se utiliza el "varchar"
    entrada INT,
    salida INT,
    saldo INT GENERATED ALWAYS AS (entrada - salida) STORED
);

-- Tabla: usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    rol ENUM('cliente', 'admin', 'super_usuario') DEFAULT 'cliente',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente', 'Despachado', 'Concluido') DEFAULT 'Pendiente',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE detalles_venta (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

/*Consultas*/
/*UPDATE usuarios
SET rol = 'admin'
WHERE id_usuario = 1;*/

-- script para reportes de ventas en el panel de administrador
use bike_store;

select * from detalles_venta;
select * from ventas;
select * from usuarios;

-- de la tabla usuarios se trae el nombre, el correo
-- de la tabla ventas se trae la fecha_venta 
-- de la tabla detalles_venta se trae la cantidad, precio_unitario, total

USE bike_store;

SELECT 
    u.nombre AS nombre_usuario,
    u.correo AS correo_usuario,
    v.fecha_venta,
    dv.cantidad,
    dv.precio_unitario,
    dv.total
FROM detalles_venta dv
INNER JOIN ventas v ON dv.id_venta = v.id_venta
INNER JOIN usuarios u ON v.id_usuario = u.id_usuario;