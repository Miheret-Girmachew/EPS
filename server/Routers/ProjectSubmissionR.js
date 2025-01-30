const express = require('express');
const {
  createProjectSubmission,
  getProjectSubmissions,
  updateProjectSubmissionById,
  getAllProjectSubmissions,
  deleteProjectSubmissionById
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

module.exports = router;