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

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: API for managing projects.
 */

/**
 * @swagger
 * /api/projects/create/batch/{id}:
 *   post:
 *     summary: Create a new project within a specific batch
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the batch to which the project will be added.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "API Development Project"
 *               description:
 *                 type: string
 *                 example: "Build and document a REST API."
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-15T23:59:00Z"
 *     responses:
 *       201:
 *         description: Project created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad request (e.g., missing title).
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Batch not found.
 */
router.post('/create/batch/:id', authenticateToken, createProject);

/**
 * @swagger
 * /api/projects/batch/{id}:
 *   get:
 *     summary: Get all projects for a specific batch
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the batch.
 *     responses:
 *       200:
 *         description: An array of projects belonging to the batch.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       404:
 *         description: Batch not found.
 */
router.get('/batch/:id', getProjects);

/**
 * @swagger
 * /api/projects/oneproject/{id}:
 *   get:
 *     summary: Get a single project by its own ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the project to retrieve.
 *     responses:
 *       200:
 *         description: A single project object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found.
 */
router.get('/oneproject/:id', getProjectById);

/**
 * @swagger
 * /api/projects/update/{id}:
 *   patch:
 *     summary: Update an existing project by its ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project to update.
 *     requestBody:
 *       description: Fields to update for the project.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated API Project Title"
 *               description:
 *                 type: string
 *                 example: "Updated project description."
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-10T23:59:00Z"
 *     responses:
 *       200:
 *         description: Project updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Project not found.
 */
router.patch('/update/:id', authenticateToken, updateProjectById);

/**
 * @swagger
 * /api/projects/delete/{id}:
 *   delete:
 *     summary: Delete a project by its ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project to delete.
 *     responses:
 *       200:
 *         description: Project deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Project not found.
 */
router.delete('/delete/:id', authenticateToken, deleteProjectById);

module.exports = router;