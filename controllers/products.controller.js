const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "lfmerukkeiac5y5w.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "zl7hscl57lqj6v8t",
  password: "q34349j21foz3kaj",
  database: "sw0dlc2au9k1ddsd",
  port: 3306,
  multipleStatements: true,
});

exports.getProducts = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM productos");
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al consultar los productos");
  }
};

exports.getProductByCode = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM productos WHERE codigo = ?",
      [req.params.codigo]
    );
    conn.release();
    if (rows.length === 0) {
      res.status(404).send("producto no encontrado");
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al consultar el producto");
  }
};

exports.createProduct = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const { nombre, descripcion, precio, cantidad } = req.body;
    const [result] = await conn.execute(
      "INSERT INTO productos(nombre, descripcion, precio, cantidad) VALUES (?, ?, ?, ?)",
      [nombre, descripcion, precio, cantidad]
    );
    conn.release();
    res.json({ ...req.body, codigo: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear el producto");
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const { nombre, descripcion, precio, cantidad } = req.body;
    const [result] = await conn.query(
      "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, cantidad = ? WHERE codigo = ?",
      [nombre, descripcion, precio, cantidad, req.params.codigo]
    );
    conn.release();
    if (result.affectedRows === 0) {
      res.status(404).send("producto no encontrado");
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar el producto");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      "DELETE FROM productos WHERE codigo = ?",
      [req.params.codigo]
    );
    conn.release();
    if (result.affectedRows === 0) {
      res.status(404).send("producto no encontrado");
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar el producto");
  }
};
