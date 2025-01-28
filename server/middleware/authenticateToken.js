const jwt = require('jsonwebtoken');
const { User } = require('../models');


const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // console.log('Authorization Header:', authHeader); 
  const token = authHeader && authHeader.split(' ')[1];
  // console.log('Extracted Token:', token); 
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  // console.log('Verifying Secret Key:', process.env.SECRET_KEY);

  jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
    if (err) {
      // console.log('Token verification error:', err);
      return res.status(403).json({ message: 'Token is not valid', error: err.message });
    }
   
    console.log("User Role:", user.role); 

    req.user = user; 

    // Proceed without role restriction
    next(); 
    // if (user.role === "1") {
    //   next(); // Proceed for admins
    // } else {
    //   return res.status(403).json({ message: `Access denied. Your role: ${user.role}. Admins only.`

      //  });
    // }
  });
};

module.exports = authenticateToken;
