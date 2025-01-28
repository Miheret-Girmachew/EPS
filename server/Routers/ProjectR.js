const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById
} = require('../controllers/ProjectC');

const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');


router.post('/create/batch/:id', authenticateToken, createProject);
router.get('/batch/:id', getProjects);
router.get('/oneproject/:id', getProjectById);
router.patch('/update/:id', authenticateToken, updateProjectById);
router.delete('/delete/:id',authenticateToken, deleteProjectById);

module.exports = router;
