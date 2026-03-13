const jwt = require('jsonwebtoken');

const generarToken = (usuario) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en el archivo .env');
  }

  return jwt.sign(
    {
      id: usuario.id,
      compania_id: usuario.compania_id,
      rol_id: usuario.rol_id,
      correo: usuario.correo,
      nombre_completo: usuario.nombre_completo
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

module.exports = {
  generarToken
};