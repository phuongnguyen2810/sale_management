const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/all', userController.getUsers); // API: http://localhost:5000/api/users/all
router.put('/update/:id', userController.updateUser); // API: http://localhost:5000/api/users/update/ID
router.delete('/delete/:id', userController.deleteUser); // API: http://localhost:5000/api/users/delete/ID
router.get('/user/:userId', userController.getUserById);
router.post('/register', userController.createUser);      // ✅ thêm
router.post('/login', userController.login);   

module.exports = router;