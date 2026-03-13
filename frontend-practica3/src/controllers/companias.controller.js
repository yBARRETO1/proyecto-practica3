const pool = require('../config/db');

const crearCompania = async (req, res, next) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre de la compañía es obligatorio'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO companias (nombre)
       VALUES (?)`,
      [nombre]
    );

    return res.status(201).json({
      ok: true,
      mensaje: 'Compañía creada correctamente',
      data: {
        id: result.insertId,
        nombre
      }
    });
  } catch (error) {
    next(error);
  }
};

const listarCompanias = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, nombre, fecha_creacion, fecha_actualizacion
       FROM companias
       ORDER BY id DESC`
    );

    return res.json({
      ok: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const obtenerCompaniaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT id, nombre, fecha_creacion, fecha_actualizacion
       FROM companias
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Compañía no encontrada'
      });
    }

    return res.json({
      ok: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearCompania,
  listarCompanias,
  obtenerCompaniaPorId
};