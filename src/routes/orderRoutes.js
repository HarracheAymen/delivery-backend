const express = require('express');
const router = express.Router();
const {
  createOrder,
  acceptOrderByDriver,
  updateOrderStatus,
} = require('../controllers/orderController');

router.post('/', createOrder);
router.patch('/:id/accept', acceptOrderByDriver);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;