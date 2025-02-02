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
router.get('/reset-password/:token', resetPassword);
router.post('/submission', updateStudentSubmissionStatus);
router.post('/students', getAllStudents);
router.post('/instructors', getAllInstructors);


module.exports = router;
