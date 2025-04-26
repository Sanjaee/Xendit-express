const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product.routes');
const paymentRoutes = require('./routes/payment.routes');
const { errorHandler } = require('./utils/response.util');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', productRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

module.exports = app;