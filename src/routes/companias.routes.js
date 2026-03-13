const express = require('express');
const router = express.Router();

const {
  crearCompania,
  listarCompanias,
  obtenerCompaniaPorId
} = require('../controllers/companias.controller');

router.post('/', crearCompania);
router.get('/', listarCompanias);
router.get('/:id', obtenerCompaniaPorId);

module.exports = router;