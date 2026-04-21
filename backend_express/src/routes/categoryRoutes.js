const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { isAdmin} = require('../middleware/auth')

    
router.get('/all', categoryController.getCategories);
router.post('/add', isAdmin, categoryController.createCategory);
router.put('/update/:id', isAdmin, categoryController.updateCategory);
router.delete('/delete/:id', isAdmin, categoryController.deleteCategory);


module.exports = router;