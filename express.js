const express = require('express');
const mysql = require('mysql2/promise');
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
app.get('/products', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM productos');
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al consultar los productos');
  }
});

app.get('/products/:codigo', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM productos WHERE codigo = ?', [req.params.codigo]);
    conn.release();
    if (rows.length === 0) {
      res.status(404).send('producto no encontrado');
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al consultar el producto');
  }
});

app.post('/products', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const { nombre, descripcion, precio, cantidad } = req.body;
    const [result] = await conn.execute('INSERT INTO productos(nombre, descripcion, precio, cantidad) VALUES (?, ?, ?, ?)', [ nombre, descripcion, precio, cantidad]);
    conn.release();
    res.json({ ...req.body, codigo: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear el producto');
  }
});

app.patch('/products/:codigo', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const { nombre, descripcion, precio, cantidad } = req.body;
    const [result] = await conn.query('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, cantidad = ? WHERE codigo = ?', [nombre, descripcion, precio, cantidad, req.params.codigo]);
    conn.release();
    console.log(result)
    res.json({ ...req.body, codigo: result.insertId });
    if (result.affectedRows === 0) {
      res.status(404).send('producto no encontrado');
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar el producto');
  }
});

app.delete('/products/:codigo', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query('DELETE FROM productos WHERE codigo = ?', [req.params.codigo]);
    conn.release();
    if (result.affectedRows === 0) {
      res.status(404).send('producto no encontrado');
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar el producto');
  }
});

// Rutas para las ventas
app.get('/sales', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM ventas');
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al consultar las ventas');
  }
});

app.get('/sales/:codigo', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM ventas WHERE codigo = ?', [req.params.codigo]);
    conn.release();
    if (rows.length === 0) {
      res.status(404).send('venta no encontrada');
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al consultar la venta');
  }
});

app.post('/sales', async (req, res) => {
    try {
      const conn = await pool.getConnection();
      const { codigo_producto, nombre_cliente, telefono_cliente, fecha_venta, cantidad_vendida, total_venta } = req.body;
      const [result] = await conn.query('INSERT INTO ventas(codigo_producto, nombre_cliente, telefono_cliente, fecha_venta, cantidad_vendida, total_venta) VALUES (?, ?, ?, ?, ?, ?)', [codigo_producto, nombre_cliente, telefono_cliente, fecha_venta, cantidad_vendida, total_venta]);
      const [rows] = await conn.query('SELECT * FROM productos WHERE codigo = ?', [codigo_producto]);
      const cantidadActual = rows[0].cantidad;
      const nuevaCantidad = cantidadActual - cantidad_vendida;
      await conn.query('UPDATE productos SET cantidad = ? WHERE codigo = ?', [nuevaCantidad, codigo_producto]);
      conn.release();
      res.json({ ...req.body, codigo: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error al crear la venta');
    }
  });

  app.patch('/sales/:codigo', async (req, res) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM ventas WHERE codigo = ?', [req.params.codigo]);
      if (rows.length === 0) {
        res.status(404).send('venta no encontrada');
        return;
      }
      if (req.body.codigo) {
        res.status(400).send('No se puede actualizar el campo "codigo"');
        return;
      }
      const { codigo_producto, nombre_cliente, telefono_cliente, fecha_venta, cantidad_vendida, total_venta } = req.body;
      const fieldsToUpdate = {};
      if (codigo_producto) fieldsToUpdate.codigo_producto = codigo_producto;
      if (nombre_cliente) fieldsToUpdate.nombre_cliente = nombre_cliente;
      if (telefono_cliente) fieldsToUpdate.telefono_cliente = telefono_cliente;
      if (fecha_venta) fieldsToUpdate.fecha_venta = fecha_venta;
      if (cantidad_vendida) fieldsToUpdate.cantidad_vendida = cantidad_vendida;
      if (total_venta) fieldsToUpdate.total_venta = total_venta;
      const [result] = await conn.query('UPDATE ventas SET ? WHERE codigo = ?', [fieldsToUpdate, req.params.codigo]);
      conn.release();
      if (result.affectedRows === 0) {
        res.status(404).send('venta no encontrada');
      } else {
        res.sendStatus(204);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error al actualizar la venta');
    }
  });

app.delete('/sales/:codigo', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query('DELETE FROM ventas WHERE codigo = ?', [req.params.codigo]);
    conn.release();
    if (result.affectedRows === 0) {
      res.status(404).send('venta no encontrada');
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar la venta');
  }
});

// Inicio del servidor
app.listen(3001, () => {
  console.log('Servidor iniciado en el puerto 3000');
});