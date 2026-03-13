const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const registrarUsuario = async (req, res, next) => {
  try {
    const {
      compania_id,
      rol_id,
      nombre_completo,
      correo,
      contrasena
    } = req.body;

    if (!compania_id || !rol_id || !nombre_completo || !correo || !contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    const [result] = await pool.execute(
      `INSERT INTO usuarios (
        compania_id,
        rol_id,
        nombre_completo,
        correo,
        contrasena_hash,
        activo
      ) VALUES (?, ?, ?, ?, ?, 1)`,
      [compania_id, rol_id, nombre_completo, correo, contrasena_hash]
    );

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado correctamente',
      data: {
        id: result.insertId,
        compania_id,
        rol_id,
        nombre_completo,
        correo
      }
    });
  } catch (error) {
    next(error);
  }
};

const listarUsuarios = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        u.id,
        u.compania_id,
        c.nombre AS compania,
        u.rol_id,
        r.nombre AS rol,
        u.nombre_completo,
        u.correo,
        u.activo,
        u.fecha_creacion,
        u.fecha_actualizacion
      FROM usuarios u
      INNER JOIN companias c ON c.id = u.compania_id
      INNER JOIN roles r ON r.id = u.rol_id
      ORDER BY u.id DESC`
    );

    return res.json({
      ok: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT
        u.id,
        u.compania_id,
        c.nombre AS compania,
        u.rol_id,
        r.nombre AS rol,
        u.nombre_completo,
        u.correo,
        u.activo,
        u.fecha_creacion,
        u.fecha_actualizacion
      FROM usuarios u
      INNER JOIN companias c ON c.id = u.compania_id
      INNER JOIN roles r ON r.id = u.rol_id
      WHERE u.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Usuario no encontrado'
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
  registrarUsuario,
  listarUsuarios,
  obtenerUsuarioPorId
};