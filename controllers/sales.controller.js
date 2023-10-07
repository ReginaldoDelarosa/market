const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "lfmerukkeiac5y5w.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "zl7hscl57lqj6v8t",
  password: "q34349j21foz3kaj",
  database: "sw0dlc2au9k1ddsd",
  port: 3306,
  multipleStatements: true,
});

exports.getSales = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM ventas");
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al consultar las ventas");
  }
};


exports.createSale = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const {
      codigo_producto,
      nombre_cliente,
      telefono_cliente,
      fecha_venta,
      cantidad_vendida,
      total_venta,
    } = req.body;
    const [result] = await conn.query(
      "INSERT INTO ventas(codigo_producto, nombre_cliente, telefono_cliente, fecha_venta, cantidad_vendida, total_venta) VALUES (?, ?, ?, ?, ?, ?)",
      [
        codigo_producto,
        nombre_cliente,
        telefono_cliente,
        fecha_venta,
        cantidad_vendida,
        total_venta,
      ]
    );
    const [rows] = await conn.query(
      "SELECT * FROM productos WHERE codigo = ?",
      [codigo_producto]
    );
    const cantidadActual = rows[0].cantidad;
    const nuevaCantidad = cantidadActual - cantidad_vendida;
    await conn.query("UPDATE productos SET cantidad = ? WHERE codigo = ?", [
      nuevaCantidad,
      codigo_producto,
    ]);
    conn.release();
    res.json({ ...req.body, codigo: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear la venta");
  }
};

exports.updateSale = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM ventas WHERE codigo = ?", [
      req.params.codigo,
    ]);
    if (rows.length === 0) {
      res.status(404).send("venta no encontrada");
      return;
    }
    if (req.body.codigo) {
      res.status(400).send('No se puede actualizar el campo "codigo"');
      return;
    }
    const {
      codigo_producto,
      nombre_cliente,
      telefono_cliente,
      fecha_venta,
      cantidad_vendida,
      total_venta,
    } = req.body;
    const fieldsToUpdate = {};
    if (codigo_producto) fieldsToUpdate.codigo_producto = codigo_producto;
    if (nombre_cliente) fieldsToUpdate.nombre_cliente = nombre_cliente;
    if (telefono_cliente) fieldsToUpdate.telefono_cliente = telefono_cliente;
    if (fecha_venta) fieldsToUpdate.fecha_venta = fecha_venta;
    if (cantidad_vendida) fieldsToUpdate.cantidad_vendida = cantidad_vendida;
    if (total_venta) fieldsToUpdate.total_venta = total_venta;
    const [result] = await conn.query("UPDATE ventas SET ? WHERE codigo = ?", [
      fieldsToUpdate,
      req.params.codigo,
    ]);
    conn.release();
    if (result.affectedRows === 0) {
      res.status(404).send("venta no encontrada");
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar la venta");
  }
};
exports.getSaleByCode = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM ventas WHERE codigo = ?", [
      req.params.codigo,
    ]);
    conn.release();
    if (rows.length === 0) {
      res.status(404).send("venta no encontrada");
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener la venta");
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query("DELETE FROM ventas WHERE codigo = ?", [
      req.params.codigo,
    ]);
    conn.release();
    if (result.affectedRows === 0) {
      res.status(404).send("venta no encontrada");
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar la venta");
  }
};
