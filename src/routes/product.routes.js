// File: src/routes/product.routes.js
const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

// Route untuk mendapatkan semua produk
router.get('/products', productController.getAllProducts);

// Route untuk mendapatkan produk berdasarkan ID
router.get('/products/:id', productController.getProductById);

module.exports = router;
