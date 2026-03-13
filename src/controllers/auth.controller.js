const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generarToken } = require('../utils/jwt');

const login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Correo y contraseña son obligatorios'
      });
    }

    const [rows] = await pool.execute(
      `SELECT
        u.id,
        u.compania_id,
        u.rol_id,
        u.nombre_completo,
        u.correo,
        u.contrasena_hash,
        u.activo,
        c.nombre AS compania_nombre,
        r.nombre AS rol_nombre
      FROM usuarios u
      INNER JOIN companias c ON c.id = u.compania_id
      INNER JOIN roles r ON r.id = u.rol_id
      WHERE u.correo = ?`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    const usuario = rows[0];

    if (!usuario.activo) {
      return res.status(403).json({
        ok: false,
        mensaje: 'Usuario inactivo'
      });
    }

    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);

    if (!passwordValida) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    const token = generarToken(usuario);

    return res.json({
      ok: true,
      mensaje: 'Inicio de sesión correcto',
      token,
      usuario: {
        id: usuario.id,
        compania_id: usuario.compania_id,
        rol_id: usuario.rol_id,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        compania_nombre: usuario.compania_nombre,
        rol_nombre: usuario.rol_nombre
      }
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        u.id,
        u.compania_id,
        u.rol_id,
        u.nombre_completo,
        u.correo,
        u.activo,
        c.nombre AS compania_nombre,
        r.nombre AS rol_nombre
      FROM usuarios u
      INNER JOIN companias c ON c.id = u.compania_id
      INNER JOIN roles r ON r.id = u.rol_id
      WHERE u.id = ?`,
      [req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    return res.json({
      ok: true,
      usuario: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  me
};