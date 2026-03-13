const pool = require('../config/db');

const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const listarCargas = async (req, res, next) => {
  try {
    const compania_id = req.usuario.compania_id;
    const {
      actor_id,
      numero_encuesta,
      fecha_carga,
      fecha_desde,
      fecha_hasta
    } = req.query;

    if (actor_id && (!/^\d+$/.test(String(actor_id)) || Number(actor_id) <= 0)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'actor_id debe ser un entero positivo'
      });
    }

    if (
      numero_encuesta &&
      (!/^\d+$/.test(String(numero_encuesta)) || Number(numero_encuesta) <= 0)
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: 'numero_encuesta debe ser un entero positivo'
      });
    }

    if (fecha_carga && !REGEX_FECHA.test(String(fecha_carga))) {
      return res.status(400).json({
        ok: false,
        mensaje: 'fecha_carga debe tener formato YYYY-MM-DD'
      });
    }

    if (fecha_desde && !REGEX_FECHA.test(String(fecha_desde))) {
      return res.status(400).json({
        ok: false,
        mensaje: 'fecha_desde debe tener formato YYYY-MM-DD'
      });
    }

    if (fecha_hasta && !REGEX_FECHA.test(String(fecha_hasta))) {
      return res.status(400).json({
        ok: false,
        mensaje: 'fecha_hasta debe tener formato YYYY-MM-DD'
      });
    }

    const condiciones = ['cc.compania_id = ?'];
    const params = [compania_id];

    if (actor_id) {
      condiciones.push('cc.actor_id = ?');
      params.push(Number(actor_id));
    }

    if (numero_encuesta) {
      condiciones.push('cc.numero_encuesta = ?');
      params.push(Number(numero_encuesta));
    }

    if (fecha_carga) {
      condiciones.push('cc.fecha_carga = ?');
      params.push(fecha_carga);
    }

    if (fecha_desde) {
      condiciones.push('cc.fecha_carga >= ?');
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      condiciones.push('cc.fecha_carga <= ?');
      params.push(fecha_hasta);
    }

    const where = condiciones.join(' AND ');

    const [rows] = await pool.execute(
      `SELECT
        cc.id,
        cc.compania_id,
        c.nombre AS compania,
        cc.actor_id,
        a.nombre AS actor,
        cc.usuario_carga_id,
        u.nombre_completo AS usuario_carga,
        cc.numero_encuesta,
        cc.fecha_carga,
        cc.total_personas,
        cc.total_respuestas,
        cc.v1,
        cc.v2,
        cc.v3,
        cc.v4,
        cc.v5,
        cc.v6,
        cc.v7,
        cc.v8,
        cc.v9,
        cc.v10,
        cc.v11,
        cc.f1,
        cc.f2,
        cc.f3,
        cc.f4,
        cc.total,
        cc.fecha_creacion,
        cc.fecha_actualizacion
      FROM calculos_cargas cc
      INNER JOIN companias c ON c.id = cc.compania_id
      INNER JOIN actores a ON a.id = cc.actor_id
      INNER JOIN usuarios u ON u.id = cc.usuario_carga_id
      WHERE ${where}
      ORDER BY cc.fecha_carga DESC, cc.actor_id ASC, cc.numero_encuesta ASC`,
      params
    );

    return res.json({
      ok: true,
      total: rows.length,
      filtros: {
        actor_id: actor_id ? Number(actor_id) : null,
        numero_encuesta: numero_encuesta ? Number(numero_encuesta) : null,
        fecha_carga: fecha_carga || null,
        fecha_desde: fecha_desde || null,
        fecha_hasta: fecha_hasta || null
      },
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const obtenerCargaPorId = async (req, res, next) => {
  try {
    const compania_id = req.usuario.compania_id;
    const { id } = req.params;

    if (!/^\d+$/.test(String(id)) || Number(id) <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El id debe ser un entero positivo'
      });
    }

    const [rows] = await pool.execute(
      `SELECT
        cc.id,
        cc.compania_id,
        c.nombre AS compania,
        cc.actor_id,
        a.nombre AS actor,
        cc.usuario_carga_id,
        u.nombre_completo AS usuario_carga,
        cc.numero_encuesta,
        cc.fecha_carga,
        cc.total_personas,
        cc.total_respuestas,
        cc.v1,
        cc.v2,
        cc.v3,
        cc.v4,
        cc.v5,
        cc.v6,
        cc.v7,
        cc.v8,
        cc.v9,
        cc.v10,
        cc.v11,
        cc.f1,
        cc.f2,
        cc.f3,
        cc.f4,
        cc.total,
        cc.fecha_creacion,
        cc.fecha_actualizacion
      FROM calculos_cargas cc
      INNER JOIN companias c ON c.id = cc.compania_id
      INNER JOIN actores a ON a.id = cc.actor_id
      INNER JOIN usuarios u ON u.id = cc.usuario_carga_id
      WHERE cc.id = ? AND cc.compania_id = ?`,
      [Number(id), compania_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Carga no encontrada'
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

const eliminarCargaPorId = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const compania_id = req.usuario.compania_id;
    const { id } = req.params;

    if (!/^\d+$/.test(String(id)) || Number(id) <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El id debe ser un entero positivo'
      });
    }

    const [cargaRows] = await connection.execute(
      `SELECT
        id,
        compania_id,
        actor_id,
        numero_encuesta,
        fecha_carga,
        total_personas,
        total_respuestas
      FROM calculos_cargas
      WHERE id = ? AND compania_id = ?`,
      [Number(id), compania_id]
    );

    if (cargaRows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Carga no encontrada'
      });
    }

    const carga = cargaRows[0];

    await connection.beginTransaction();

    const [deleteRespuestasResult] = await connection.execute(
      `DELETE FROM respuestas
       WHERE compania_id = ?
         AND actor_id = ?
         AND numero_encuesta = ?
         AND fecha_carga = ?`,
      [
        carga.compania_id,
        carga.actor_id,
        carga.numero_encuesta,
        carga.fecha_carga
      ]
    );

    const [deleteCalculoResult] = await connection.execute(
      `DELETE FROM calculos_cargas
       WHERE id = ? AND compania_id = ?`,
      [carga.id, carga.compania_id]
    );

    await connection.commit();

    return res.json({
      ok: true,
      mensaje: 'Carga eliminada correctamente',
      data: {
        carga_id: carga.id,
        actor_id: carga.actor_id,
        numero_encuesta: carga.numero_encuesta,
        fecha_carga: carga.fecha_carga,
        respuestas_eliminadas: deleteRespuestasResult.affectedRows,
        calculos_eliminados: deleteCalculoResult.affectedRows
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  listarCargas,
  obtenerCargaPorId,
  eliminarCargaPorId
};