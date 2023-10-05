const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'lyn7gfxo996yjjco.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'd1f4i7n8p4phd0xi',
    password: 'ujr5diknro1d9q21',
    database: 'ne70en5twe269oni',
    port: 3306,
    multipleStatements: true
  });

exports.getProducts = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM productos');
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al consultar los productos');
  }
};

exports.getProductByCode = async (req, res) => {
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
};

exports.createProduct = async (req, res) => {
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
};

exports.updateProduct = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const { nombre, descripcion, precio, cantidad } = req.body;
    const [result] = await conn.query('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, cantidad = ? WHERE codigo = ?', [nombre, descripcion, precio, cantidad, req.params.codigo]);
    conn.release();
    if (result.affectedRows === 0) {
      res.status(404).send('producto no encontrado');
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar el producto');
  }
};