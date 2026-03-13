const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      ok: false,
      mensaje: 'Registro duplicado o ya existente'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      ok: false,
      mensaje: 'La compañía o el rol enviado no existen'
    });
  }

  return res.status(err.status || 500).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;