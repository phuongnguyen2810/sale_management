const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin } = require('../middleware/auth');

router.post('/add', isAdmin, productController.createProduct); 
router.put('/update/:id', isAdmin, productController.updateProduct);
router.delete('/delete/:id', isAdmin, productController.deleteProduct);
router.get('/all', productController.getProducts);

module.exports = router;