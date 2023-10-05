const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller.js');

router.get('/sales', salesController.getSales);
router.post('/sales', salesController.createSale);
router.patch('/sales/:codigo', salesController.updateSale);

module.exports = router;