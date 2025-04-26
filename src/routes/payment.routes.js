// File: src/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/orders', paymentController.createOrder);
router.post('/process', paymentController.createPayment);
router.post('/callback', paymentController.simulatePaymentCallback);
router.get('/:id/status', paymentController.getPaymentStatus);

module.exports = router;