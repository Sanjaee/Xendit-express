// File: src/controllers/payment.controller.js

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response.util');
const xenditService = require('../services/xendit.service');

const prisma = new PrismaClient();

exports.createOrder = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Pastikan productId adalah string
    if (typeof productId !== 'string') {
      return errorResponse(res, 'Invalid product ID format', 400);
    }

    // Validasi produk
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    const totalAmount = product.price * quantity;

    // Buat order
    const order = await prisma.order.create({
      data: {
        productId,
        quantity,
        totalAmount,
        status: 'PENDING',
      },
      include: {
        product: true,
      },
    });

    return successResponse(res, order, 'Order created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const { orderId, method } = req.body;

    // Pastikan orderId adalah string
    if (typeof orderId !== 'string') {
      return errorResponse(res, 'Invalid order ID format', 400);
    }

    // Validasi order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: true,
        payment: true,
      },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    if (order.status === 'PAID') {
      return errorResponse(res, 'Order has already been paid', 400);
    }

    if (order.payment) {
      return errorResponse(res, 'Payment already exists for this order', 400);
    }

    // Buat external reference ID
    const externalId = `payment_${uuidv4()}`;

    // Buat pembayaran berdasarkan metode
    let paymentData;

    if (method === 'BANK_TRANSFER') {
      paymentData = await xenditService.createVirtualAccount(externalId, order.totalAmount, order.product.name);
    } else if (method === 'CREDIT_CARD') {
      paymentData = await xenditService.createCreditCardPayment(externalId, order.totalAmount, order.product.name);
    } else if (method === 'E_WALLET') {
      paymentData = await xenditService.createEWalletPayment(externalId, order.totalAmount, order.product.name);
    } else {
      return errorResponse(res, 'Invalid payment method', 400);
    }

    // Simulasikan callback pembayaran (hanya untuk pengujian)
    setTimeout(async () => {
      try {
        await prisma.payment.update({
          where: { externalId: paymentData.externalId },
          data: { status: 'PAID' },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
        });

        console.log(`Simulated payment callback for externalId: ${paymentData.externalId}`);
      } catch (err) {
        console.error('Error simulating payment callback:', err);
      }
    }, 5000); // Simulasi setelah 5 detik

    // Buat catatan pembayaran
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        externalId: paymentData.externalId,
        amount: order.totalAmount,
        method,
        status: 'PENDING',
        paymentUrl: paymentData.paymentUrl || null,
        metadata: paymentData,
      },
    });

    return successResponse(
      res,
      {
        payment,
        paymentUrl: paymentData.paymentUrl || null,
      },
      'Payment created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

exports.simulatePaymentCallback = async (req, res, next) => {
  try {
    const { externalId } = req.body;

    // Temukan pembayaran berdasarkan external ID
    const payment = await prisma.payment.findUnique({
      where: { externalId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }

    // Perbarui status pembayaran
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
      },
    });

    // Perbarui status order
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'PAID',
      },
    });

    return successResponse(res, updatedPayment, 'Payment completed successfully');
  } catch (error) {
    next(error);
  }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }

    return successResponse(res, payment, 'Payment status retrieved successfully');
  } catch (error) {
    next(error);
  }
};
