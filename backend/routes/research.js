const express = require('express');
const router = express.Router();
const researchCtrl = require('../controllers/research.js');

router.post('/', researchCtrl.research);

module.exports = router;