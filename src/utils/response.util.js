// File: src/utils/response.util.js
exports.successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };
  
  exports.errorResponse = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  };
  
  exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Check if error is from Prisma
    if (err.name === 'PrismaClientKnownRequestError') {
      return exports.errorResponse(res, 'Database error', 400, err.message);
    }
    
    // Check if error is from Xendit
    if (err.name === 'XenditError') {
      return exports.errorResponse(res, err.message, 400, err);
    }
    
    // Default error
    return exports.errorResponse(res, err.message || 'Server error', err.statusCode || 500);
  };