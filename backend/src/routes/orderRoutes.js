const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, collectOrder, payOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.post('/pay', protect, payOrder);
router.post('/collect', protect, authorize('store_manager', 'admin'), collectOrder);

module.exports = router;