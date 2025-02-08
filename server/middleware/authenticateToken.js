const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, decodedUser) => {
    if (err) {
      console.log('Token is not valid:', err.message);
      return res.status(403).json({ message: 'Token is not valid', error: err.message });
    }

    console.log("Decoded JWT payload:", decodedUser);

    // Use `userId` instead of `user_id`
    const dbUser = await User.findOne({ where: { userId: decodedUser.userId } });

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = dbUser;
    next();
  });
};

module.exports = authenticateToken;
