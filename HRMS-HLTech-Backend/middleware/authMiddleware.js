const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.header('Authorization');
  console.log('Authorization header:', authHeader || 'None', 'Endpoint:', `${req.method} ${req.originalUrl}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided or invalid format', 'Endpoint:', `${req.method} ${req.originalUrl}`);
    return res.status(401).json({ message: 'No token provided or invalid format, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token extracted:', token ? token.slice(0, 10) + '...' : 'null', 'Endpoint:', `${req.method} ${req.originalUrl}`);

  if (!token) {
    console.log('Token is empty after extraction', 'Endpoint:', `${req.method} ${req.originalUrl}`);
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', { userId: decoded.userId, role: decoded.role, fullName: decoded.fullName, email: decoded.email }, 'Endpoint:', `${req.method} ${req.originalUrl}`);

    if (!decoded.userId) {
      console.log('Token does not contain userId:', decoded, 'Endpoint:', `${req.method} ${req.originalUrl}`);
      return res.status(401).json({ message: 'Invalid token: userId missing' });
    }

    // Set req.user with id field to match what routes expect
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      fullName: decoded.fullName,
      email: decoded.email,
    };
    console.log('req.user set:', req.user, 'Endpoint:', `${req.method} ${req.originalUrl}`);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message, error.stack, 'Endpoint:', `${req.method} ${req.originalUrl}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

module.exports = authMiddleware;