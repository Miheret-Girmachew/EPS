const express = require('express');
const {
  createProjectSubmission,
  getProjectSubmissions,
  getAllProjectSubmissions,
  updateProjectSubmissionById,
  deleteProjectSubmissionById,
  updateSubmissionStatus, // Import the new controller
} = require('../controllers/ProjectSubmissionC');

const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

router.post('/create', authenticateToken, (req, res, next) => {
  console.log("Route /create called");
  next();
}, createProjectSubmission);

router.get('/all', authenticateToken, getProjectSubmissions);
router.get('/allprojects', getAllProjectSubmissions);
router.patch('/update/:id',authenticateToken, updateProjectSubmissionById);
router.delete('/delete/:id', authenticateToken, deleteProjectSubmissionById);
router.put('/submissions/:id/status', authenticateToken, updateSubmissionStatus); // Add the new route

module.exports = router;