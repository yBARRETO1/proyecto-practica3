const express = require('express');
const router = express.Router();

const {
  registrarUsuario,
  listarUsuarios,
  obtenerUsuarioPorId
} = require('../controllers/usuarios.controller');

router.post('/registro', registrarUsuario);
router.get('/', listarUsuarios);
router.get('/:id', obtenerUsuarioPorId);

module.exports = router;