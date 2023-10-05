const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller.js');

router.get('/products', productsController.getProducts);
router.get('/products/:codigo', productsController.getProductByCode);
router.post('/products', productsController.createProduct);
router.patch('/products/:codigo', productsController.updateProduct);
router.delete('/products/:codigo', productsController.deleteProduct);

module.exports = router;