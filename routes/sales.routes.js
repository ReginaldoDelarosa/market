const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller.js');

router.get('/sales', salesController.getSales);
router.get('/sales/:codigo', salesController.getSaleByCode);
router.post('/sales', salesController.createSale);
router.patch('/sales/:codigo', salesController.updateSale);
router.delete('/sales/:codigo', salesController.deleteSale);

module.exports = router;