// File: src/controllers/product.controller.js
const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response.util');

const prisma = new PrismaClient();

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(res, products, 'Products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    return successResponse(res, product, 'Product retrieved successfully');
  } catch (error) {
    next(error);
  }
};