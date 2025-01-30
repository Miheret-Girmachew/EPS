const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
    if (err) {
      console.log('Token is not valid:', err.message);
      return res.status(403).json({ message: 'Token is not valid', error: err.message });
    }

    // Log the decoded user object
    console.log("Decoded user from token:", user);

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;