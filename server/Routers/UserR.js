const express = require('express');
const { 
  createUser, 
  loginUser, 
  getUserById, 
  updateUserById, 
  requestPasswordReset, 
  updateUserVisibilityByAdmin,
  updateStudentSubmissionStatus,
  resetPassword,
  getAllStudents,
  getAllInstructors
} = require('../controllers/UserC');

const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/:id', getUserById);
router.patch('/:id', updateUserById);
router.patch('/vis/:id', authenticateToken, updateUserVisibilityByAdmin);
router.post('/request-password-reset', requestPasswordReset);

// Serve the password reset page or redirect the user
// router.get('/reset-password/:token', (req, res) => {
//   res.redirect(`http://localhost:5173/reset-password/${req.params.token}`);
// });
router.get('/reset-password/:token', resetPassword);

router.post('/submission', updateStudentSubmissionStatus);
// router.get('/students', authenticateToken, getAllStudents);
router.post('/students', getAllStudents);
router.post('/instructors', getAllInstructors);


module.exports = router;
