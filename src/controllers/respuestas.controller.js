
const XLSX = require('xlsx');
const pool = require('../config/db');
const { calcularFactores, redondear } = require('../utils/calculos.util');

const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_CALIFICACION = /^(10(\.0{1,2})?|[0-9](\.\d{1,2})?)$/;

const obtenerSiguienteNumeroPersona = async (
  connection,
  compania_id,
  actor_id,
  fecha_carga,
  numero_encuesta
) => {
  const [rows] = await connection.execute(
    `SELECT COALESCE(MAX(numero_persona), 0) AS maximo
     FROM respuestas
     WHERE compania_id = ?
       AND actor_id = ?
       AND fecha_carga = ?
       AND numero_encuesta = ?`,
    [compania_id, actor_id, fecha_carga, numero_encuesta]
  );

  return Number(rows[0].maximo) + 1;
};

const validarParametrosBase = ({ actor_id, numero_encuesta, fecha_carga }) => {
  if (!actor_id || !numero_encuesta || !fecha_carga) {
    return 'actor_id, numero_encuesta y fecha_carga son obligatorios';
  }

  if (!/^\d+$/.test(String(actor_id)) || Number(actor_id) <= 0) {
    return 'actor_id debe ser un entero positivo';
  }

  if (!/^\d+$/.test(String(numero_encuesta)) || Number(numero_encuesta) <= 0) {
    return 'numero_encuesta debe ser un entero positivo';
  }

  if (!REGEX_FECHA.test(String(fecha_carga))) {
    return 'fecha_carga debe tener formato YYYY-MM-DD';
  }

  return null;
};

const listarRespuestas = async (req, res, next) => {
  try {
    const compania_id = req.usuario.compania_id;

    const [rows] = await pool.execute(
      `SELECT
        r.id,
        r.compania_id,
        c.nombre AS compania,
        r.actor_id,
        a.nombre AS actor,
        r.numero_encuesta,
        r.numero_persona,
        r.pregunta_id,
        p.codigo AS pregunta_codigo,
        p.texto AS pregunta_texto,
        r.usuario_carga_id,
        u.nombre_completo AS usuario_carga,
        r.fecha_carga,
        r.calificacion,
        r.fecha_creacion
      FROM respuestas r
      INNER JOIN companias c ON c.id = r.compania_id
      INNER JOIN actores a ON a.id = r.actor_id
      INNER JOIN preguntas p ON p.id = r.pregunta_id
      INNER JOIN usuarios u ON u.id = r.usuario_carga_id
      WHERE r.compania_id = ?
      ORDER BY r.fecha_carga DESC, r.actor_id ASC, r.numero_encuesta ASC, r.numero_persona ASC, p.id ASC`,
      [compania_id]
    );

    return res.json({
      ok: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const cargaMasivaRespuestas = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debes adjuntar un archivo'
      });
    }

    const { actor_id, numero_encuesta, fecha_carga } = req.body;

    const errorBase = validarParametrosBase({ actor_id, numero_encuesta, fecha_carga });
    if (errorBase) {
      return res.status(400).json({
        ok: false,
        mensaje: errorBase
      });
    }

    const compania_id = req.usuario.compania_id;
    const usuario_carga_id = req.usuario.id;

    const [calculoExistenteRows] = await connection.execute(
      `SELECT id
       FROM calculos_cargas
       WHERE compania_id = ?
         AND actor_id = ?
         AND numero_encuesta = ?
         AND fecha_carga = ?`,
      [compania_id, actor_id, numero_encuesta, fecha_carga]
    );

    if (calculoExistenteRows.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe una carga registrada para ese actor, fecha y número de encuesta'
      });
    }

    const [actorRows] = await connection.execute(
      `SELECT id, nombre
       FROM actores
       WHERE id = ?`,
      [actor_id]
    );

    if (actorRows.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El actor_id enviado no existe'
      });
    }

    const actor = actorRows[0];

    const [preguntasRows] = await connection.execute(
      `SELECT id, codigo, orden
       FROM preguntas
       WHERE activa = 1
       ORDER BY orden ASC`
    );

    if (preguntasRows.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No hay preguntas activas configuradas en la base de datos'
      });
    }

    const preguntasEsperadas = preguntasRows.map((p) => ({
      id: Number(p.id),
      codigo: String(p.codigo).trim().toUpperCase()
    }));

    const mapaPreguntas = new Map(
      preguntasEsperadas.map((p) => [p.codigo, p.id])
    );

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const nombreHoja = workbook.SheetNames[0];
    const hoja = workbook.Sheets[nombreHoja];

    const filas = XLSX.utils.sheet_to_json(hoja, {
      defval: '',
      raw: false
    });

    if (!filas.length) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El archivo no contiene datos'
      });
    }

    const encabezadosArchivo = Object.keys(filas[0]).map((h) => String(h).trim());
    const columnasObligatorias = ['pregunta_codigo', 'calificacion'];

    for (const columna of columnasObligatorias) {
      if (!encabezadosArchivo.includes(columna)) {
        return res.status(400).json({
          ok: false,
          mensaje: `Falta la columna obligatoria "${columna}" en el archivo`
        });
      }
    }

    const numeroPersonaInicial = await obtenerSiguienteNumeroPersona(
      connection,
      compania_id,
      Number(actor_id),
      fecha_carga,
      Number(numero_encuesta)
    );

    const errores = [];
    const registros = [];

    let indicePreguntaEsperada = 0;
    let personaOffset = 0;

    for (let i = 0; i < filas.length; i++) {
      const filaExcel = filas[i];
      const numeroFila = i + 2;

      const preguntaCodigo = String(filaExcel.pregunta_codigo || '').trim().toUpperCase();
      const calificacionTexto = String(filaExcel.calificacion ?? '').trim();

      if (!preguntaCodigo) {
        errores.push({
          fila: numeroFila,
          columna: 'pregunta_codigo',
          mensaje: 'pregunta_codigo es obligatoria'
        });
        continue;
      }

      if (!calificacionTexto) {
        errores.push({
          fila: numeroFila,
          columna: 'calificacion',
          mensaje: 'La calificación es obligatoria'
        });
        continue;
      }

      const codigoEsperado = preguntasEsperadas[indicePreguntaEsperada].codigo;

      if (preguntaCodigo !== codigoEsperado) {
        errores.push({
          fila: numeroFila,
          columna: 'pregunta_codigo',
          mensaje: `Se esperaba "${codigoEsperado}" y llegó "${preguntaCodigo}". El archivo debe venir en bloques completos y ordenados`
        });
        continue;
      }

      if (!mapaPreguntas.has(preguntaCodigo)) {
        errores.push({
          fila: numeroFila,
          columna: 'pregunta_codigo',
          mensaje: `La pregunta con código "${preguntaCodigo}" no existe o no está activa`
        });
        continue;
      }

      if (!REGEX_CALIFICACION.test(calificacionTexto)) {
        errores.push({
          fila: numeroFila,
          columna: 'calificacion',
          mensaje: 'Debe ser un número entre 0 y 10 con máximo 2 decimales y separado por punto'
        });
        continue;
      }

      const numero_persona = numeroPersonaInicial + personaOffset;

      registros.push({
        compania_id,
        actor_id: Number(actor_id),
        pregunta_id: mapaPreguntas.get(preguntaCodigo),
        usuario_carga_id,
        numero_encuesta: Number(numero_encuesta),
        numero_persona,
        fecha_carga,
        pregunta_codigo: preguntaCodigo,
        calificacion: Number(calificacionTexto)
      });

      indicePreguntaEsperada++;

      if (indicePreguntaEsperada === preguntasEsperadas.length) {
        indicePreguntaEsperada = 0;
        personaOffset++;
      }
    }

    if (indicePreguntaEsperada !== 0) {
      errores.push({
        fila: filas.length + 1,
        columna: 'pregunta_codigo',
        mensaje: 'El archivo termina con una encuesta incompleta; falta completar el bloque final'
      });
    }

    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El archivo contiene errores de validación',
        errores
      });
    }

    const totalPersonas = personaOffset;
    const totalRespuestas = registros.length;

    const acumulados = {
      v1: 0, v2: 0, v3: 0, v4: 0, v5: 0, v6: 0,
      v7: 0, v8: 0, v9: 0, v10: 0, v11: 0
    };

    for (const item of registros) {
      const clave = item.pregunta_codigo.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(acumulados, clave)) {
        acumulados[clave] += Number(item.calificacion);
      }
    }

    const variablesPromedio = {
      v1: redondear(acumulados.v1 / totalPersonas),
      v2: redondear(acumulados.v2 / totalPersonas),
      v3: redondear(acumulados.v3 / totalPersonas),
      v4: redondear(acumulados.v4 / totalPersonas),
      v5: redondear(acumulados.v5 / totalPersonas),
      v6: redondear(acumulados.v6 / totalPersonas),
      v7: redondear(acumulados.v7 / totalPersonas),
      v8: redondear(acumulados.v8 / totalPersonas),
      v9: redondear(acumulados.v9 / totalPersonas),
      v10: redondear(acumulados.v10 / totalPersonas),
      v11: redondear(acumulados.v11 / totalPersonas)
    };

    const factores = calcularFactores(actor.nombre, variablesPromedio);

    await connection.beginTransaction();

    for (const item of registros) {
      await connection.execute(
        `INSERT INTO respuestas (
          compania_id,
          actor_id,
          pregunta_id,
          usuario_carga_id,
          numero_encuesta,
          numero_persona,
          fecha_carga,
          calificacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.compania_id,
          item.actor_id,
          item.pregunta_id,
          item.usuario_carga_id,
          item.numero_encuesta,
          item.numero_persona,
          item.fecha_carga,
          item.calificacion
        ]
      );
    }

    await connection.execute(
      `INSERT INTO calculos_cargas (
        compania_id,
        actor_id,
        usuario_carga_id,
        numero_encuesta,
        fecha_carga,
        total_personas,
        total_respuestas,
        v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11,
        f1, f2, f3, f4, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        compania_id,
        Number(actor_id),
        usuario_carga_id,
        Number(numero_encuesta),
        fecha_carga,
        totalPersonas,
        totalRespuestas,
        variablesPromedio.v1,
        variablesPromedio.v2,
        variablesPromedio.v3,
        variablesPromedio.v4,
        variablesPromedio.v5,
        variablesPromedio.v6,
        variablesPromedio.v7,
        variablesPromedio.v8,
        variablesPromedio.v9,
        variablesPromedio.v10,
        variablesPromedio.v11,
        factores.f1,
        factores.f2,
        factores.f3,
        factores.f4,
        factores.total
      ]
    );

    await connection.commit();

    return res.status(201).json({
      ok: true,
      mensaje: 'Carga masiva completada correctamente',
      data: {
        actor_id: Number(actor_id),
        numero_encuesta: Number(numero_encuesta),
        fecha_carga,
        personas_cargadas: totalPersonas,
        respuestas_insertadas: totalRespuestas,
        numero_persona_inicial: numeroPersonaInicial,
        numero_persona_final: totalPersonas > 0 ? (numeroPersonaInicial + totalPersonas - 1) : null,
        calculos: {
          variables: variablesPromedio,
          factores
        }
      }
    });
  } catch (error) {
    await connection.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe una carga o se encontraron duplicados en respuestas para esa combinación'
      });
    }

    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  listarRespuestas,
  cargaMasivaRespuestas
};