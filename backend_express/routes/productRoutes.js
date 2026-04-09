const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/add', productController.createProduct);
router.get('/all', productController.getProducts);

module.exports = router;