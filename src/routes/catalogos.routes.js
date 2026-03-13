const express = require('express');
const router = express.Router();

const {
  listarRoles,
  listarActores,
  listarPreguntas
} = require('../controllers/catalogos.controller');

const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/roles', verificarToken, listarRoles);
router.get('/actores', verificarToken, listarActores);
router.get('/preguntas', verificarToken, listarPreguntas);

module.exports = router;