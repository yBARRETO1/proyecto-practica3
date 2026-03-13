
const express = require('express');
const router = express.Router();

const {
  listarRespuestas,
  cargaMasivaRespuestas
} = require('../controllers/respuestas.controller');

const { verificarToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', verificarToken, listarRespuestas);

router.post(
  '/carga-masiva',
  verificarToken,
  upload.single('archivo'),
  cargaMasivaRespuestas
);

module.exports = router;