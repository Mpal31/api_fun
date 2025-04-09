const User = require('./user.js')
const jwt = require('jsonwebtoken');

// Authentication middleware
const authMiddleware = async (req, res, next) => {
    
    console.log(process.env.secret);
    console.log("------------------------------");

    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      

      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
      
      const decoded = jwt.verify(token, process.env.secret );
      
      const user = await User.findOne({ _id: decoded.userId, token });
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid token.' });
      }
      
      // Add user to request object for use in route handlers
      req.user = decoded;
      req.token = token;
      next();

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid token.' });
      }

      console.error('Auth middleware error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports = authMiddleware