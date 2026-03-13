const express = require('express');
const router = express.Router();

const {
  listarCargas,
  obtenerCargaPorId,
  eliminarCargaPorId
} = require('../controllers/cargas.controller');

const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, listarCargas);
router.get('/:id', verificarToken, obtenerCargaPorId);
router.delete('/:id', verificarToken, eliminarCargaPorId);

module.exports = router;