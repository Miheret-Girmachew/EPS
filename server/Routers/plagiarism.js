// plagiarismRoutes.js
const express = require('express');
const { submitProjectForPlagiarismCheck, checkPlagiarismStatus } = require('../plagiarismService');

const authenticateToken = require('../middleware/authenticateToken');

const  router = express.Router();

// Route for submitting a project link for plagiarism check
router.post('/submit-link', authenticateToken, async (req, res) => {
  try {
    const { studentId, projectLink } = req.body; // Expecting a project link in the request body
    const response = await submitProjectForPlagiarismCheck(studentId, projectLink); // Modify this function to handle links
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting project link', error: error.message });
  }
});


// Route for submitting project content (authentication added)
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { studentId, projectContent } = req.body;
    const response = await submitProjectForPlagiarismCheck(studentId, projectContent);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting project', error: error.message });
  }
});

// Webhook route to receive status updates (no auth required for webhook endpoint)
router.post('/webhook-status', (req, res) => {
  const plagiarismReport = req.body;
  console.log('Received plagiarism report:', plagiarismReport);
  res.sendStatus(200); // Acknowledge receipt of the webhook
});

// Route for checking plagiarism status manually
router.get('/status/:scanId', authenticateToken, async (req, res) => {
  try {
    const scanId = req.params.scanId;
    const status = await checkPlagiarismStatus(scanId);
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: 'Error checking status', error: error.message });
  }
});

module.exports = router;
