const pool = require('../config/db');

const listarRoles = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, nombre
       FROM roles
       ORDER BY id ASC`
    );

    return res.json({
      ok: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const listarActores = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, nombre
       FROM actores
       ORDER BY id ASC`
    );

    return res.json({
      ok: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const listarPreguntas = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, codigo, texto, orden, activa
       FROM preguntas
       WHERE activa = 1
       ORDER BY orden ASC`
    );

    return res.json({
      ok: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarRoles,
  listarActores,
  listarPreguntas
};