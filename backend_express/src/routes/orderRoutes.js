const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isAdmin } = require('../middleware/auth');

router.post('/add', orderController.addOrder);
router.get('/all', orderController.getOrders);
router.get('/user/:userId', orderController.getUserOrders);

router.put('/update/:id', isAdmin, orderController.updateOrderStatus);
router.delete('/delete/:id', isAdmin, orderController.deleteOrder);
router.put('/cancel/:id', orderController.cancelOrder);

module.exports = router;
