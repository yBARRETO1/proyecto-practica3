const express = require('express');
const router = express.Router();


router.use('/auth', require('./auth.routes'));
router.use('/companias', require('./companias.routes'));
router.use('/usuarios', require('./usuarios.routes'));
router.use('/catalogos', require('./catalogos.routes'));
router.use('/respuestas', require('./respuestas.routes'));
router.use('/cargas', require('./cargas.routes'));

module.exports = router;