const express = require('express');
const mysql = require('mysql2/promise');
const productsRoutes = require('./routes/products.routes');
const salesRoutes = require('./routes/sales.routes');
const app = express();

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
  host: 'lyn7gfxo996yjjco.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'd1f4i7n8p4phd0xi',
  password: 'ujr5diknro1d9q21',
  database: 'ne70en5twe269oni',
  port: 3306,
  multipleStatements: true
});

// Creación de las tablas si no existen
(async () => {
  const conn = await pool.getConnection();
  await conn.query(`
    CREATE TABLE IF NOT EXISTS productos (
      codigo INT PRIMARY KEY AUTO_INCREMENT,
      nombre VARCHAR(255),
      descripcion TEXT,
      precio DECIMAL(10, 2),
      cantidad INT
    );
    CREATE TABLE IF NOT EXISTS ventas (
      codigo INT PRIMARY KEY AUTO_INCREMENT,
      codigo_producto INT,
      nombre_cliente VARCHAR(255),
      telefono_cliente VARCHAR(255),
      fecha_venta DATE,
      cantidad_vendida INT,
      total_venta DECIMAL(10, 2),
      FOREIGN KEY (codigo_producto) REFERENCES productos(codigo)
    );
  `);
  conn.release();
})();

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

// Rutas para los productos
app.use(productsRoutes);
app.use(salesRoutes);
// Inicio del servidor
app.listen(3001, () => {
  console.log('Servidor iniciado en el puerto 3001');
});