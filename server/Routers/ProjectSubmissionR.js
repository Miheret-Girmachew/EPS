const express = require('express');
const {
  createProjectSubmission,
  getProjectSubmissions,
  getAllProjectSubmissions,
  updateProjectSubmissionById,
  deleteProjectSubmissionById,
  updateSubmissionStatus,
} = require('../controllers/ProjectSubmissionC');

const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

/**
 * @swagger
 * tags:
 *   name: Project Submissions
 *   description: API for managing project submissions by students and instructors.
 */

/**
 * @swagger
 * /api/project-submissions/create:
 *   post:
 *     summary: Create a new project submission
 *     tags: [Project Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - submissionUrl
 *             properties:
 *               projectId:
 *                 type: integer
 *                 description: The ID of the project being submitted.
 *                 example: 1
 *               submissionUrl:
 *                 type: string
 *                 description: The URL to the student's work (e.g., GitHub, Google Drive).
 *                 example: "https://github.com/student/my-project-repo"
 *     responses:
 *       201:
 *         description: Submission created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectSubmission'
 *       400:
 *         description: Bad request (e.g., missing fields or submission already exists).
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Project not found.
 */
router.post('/create', authenticateToken, (req, res, next) => {
  console.log("Route /create called");
  next();
}, createProjectSubmission);

/**
 * @swagger
 * /api/project-submissions/all:
 *   get:
 *     summary: Get all submissions for the authenticated user
 *     tags: [Project Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An array of the user's project submissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectSubmission'
 *       401:
 *         description: Unauthorized.
 */
router.get('/all', authenticateToken, getProjectSubmissions);

/**
 * @swagger
 * /api/project-submissions/allprojects:
 *   get:
 *     summary: Get all project submissions from all users (Admin)
 *     tags: [Project Submissions]
 *     description: Retrieves a complete list of all submissions across the system. Should be protected for admin use.
 *     responses:
 *       200:
 *         description: A comprehensive list of all project submissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectSubmission'
 */
router.get('/allprojects', getAllProjectSubmissions);

/**
 * @swagger
 * /api/project-submissions/update/{id}:
 *   patch:
 *     summary: Update a specific project submission
 *     tags: [Project Submissions]
 *     description: Allows a user to update their own submission (e.g., change the URL).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the submission to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submissionUrl:
 *                 type: string
 *                 description: The new URL for the submission.
 *                 example: "https://github.com/student/my-updated-repo"
 *     responses:
 *       200:
 *         description: Submission updated successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user trying to update another user's submission).
 *       404:
 *         description: Submission not found.
 */
router.patch('/update/:id', authenticateToken, updateProjectSubmissionById);

/**
 * @swagger
 * /api/project-submissions/delete/{id}:
 *   delete:
 *     summary: Delete a project submission
 *     tags: [Project Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the submission to delete.
 *     responses:
 *       200:
 *         description: Submission deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Submission not found.
 */
router.delete('/delete/:id', authenticateToken, deleteProjectSubmissionById);

/**
 * @swagger
 * /api/project-submissions/submissions/{id}/status:
 *   put:
 *     summary: Update the status of a submission (Instructor/Admin)
 *     tags: [Project Submissions]
 *     description: Used by instructors or admins to grade or change the status of a submission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the submission to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [submitted, graded, needs_revision, accepted]
 *                 example: "graded"
 *               grade:
 *                 type: integer
 *                 example: 92
 *               feedback:
 *                 type: string
 *                 example: "Well done, but please add more comments to your code."
 *     responses:
 *       200:
 *         description: Submission status updated successfully.
 *       400:
 *         description: Bad request (e.g., invalid status value).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (e.g., a student trying to grade a submission).
 *       404:
 *         description: Submission not found.
 */
router.put('/submissions/:id/status', authenticateToken, updateSubmissionStatus);

module.exports = router;