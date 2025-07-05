const express = require('express');
const { 
  createBatch, 
  getBatchById, 
  getAllBatches, 
  updateBatchById, 
  deleteBatchById,
  addGroupToBatch,
  removeGroupFromBatch,
  updateGroupInBatch,
  getGroupsByBatchId, 
  getGroupByBatchIdAndGroupName,
  assignInstructorToBatch, 
  assignInstructorToGroup,
  updateInstructorsInGroup,
  getBatchesForInstructor
} = require('../controllers/BatchC');

const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

/**
 * @swagger
 * tags:
 *   name: Batches
 *   description: API for managing academic batches and groups within them.
 */

/**
 * @swagger
 * /api/batches/create:
 *   post:
 *     summary: Create a new batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - year
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the batch.
 *                 example: "Fall 2024 Computer Science"
 *               year:
 *                 type: integer
 *                 description: The academic year of the batch.
 *                 example: 2024
 *     responses:
 *       201:
 *         description: Batch created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Batch'
 *       400:
 *         description: Bad request, invalid input.
 *       401:
 *         description: Unauthorized.
 */
router.post('/create', authenticateToken, createBatch);

/**
 * @swagger
 * /api/batches/get/{id}:
 *   get:
 *     summary: Get a single batch by its ID
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the batch to retrieve.
 *     responses:
 *       200:
 *         description: A single batch object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Batch'
 *       404:
 *         description: Batch not found.
 */
router.get('/get/:id', getBatchById);

/**
 * @swagger
 * /api/batches/all:
 *   get:
 *     summary: Get a list of all batches
 *     tags: [Batches]
 *     responses:
 *       200:
 *         description: An array of batch objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Batch'
 */
router.get('/all', getAllBatches);

/**
 * @swagger
 * /api/batches/update/{id}:
 *   patch:
 *     summary: Update an existing batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the batch to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Spring 2025 Computer Science"
 *               year:
 *                 type: integer
 *                 example: 2025
 *     responses:
 *       200:
 *         description: Batch updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Batch not found.
 */
router.patch('/update/:id', authenticateToken, updateBatchById);

/**
 * @swagger
 * /api/batches/delete/{id}:
 *   delete:
 *     summary: Delete a batch by its ID
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the batch to delete.
 *     responses:
 *       200:
 *         description: Batch deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Batch not found.
 */
router.delete('/delete/:id', authenticateToken, deleteBatchById);

/**
 * @swagger
 * /api/batches/add/{batchId}/groups:
 *   post:
 *     summary: Add a new group to a specific batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the batch to add a group to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupName
 *               - members
 *             properties:
 *               groupName:
 *                 type: string
 *                 example: "Group Alpha"
 *               members:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: An array of user IDs for the group members.
 *                 example: [10, 15, 22]
 *     responses:
 *       201:
 *         description: Group added successfully.
 *       400:
 *         description: Bad request (e.g., group already exists).
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Batch not found.
 */
router.post('/add/:batchId/groups', authenticateToken, addGroupToBatch);

/**
 * @swagger
 * /api/batches/{batchId}/groups/{groupName}:
 *   delete:
 *     summary: Remove a specific group from a batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the batch.
 *       - in: path
 *         name: groupName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the group to remove.
 *     responses:
 *       200:
 *         description: Group removed successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Batch or Group not found.
 */
router.delete('/:batchId/groups/:groupName', authenticateToken, removeGroupFromBatch);

/**
 * @swagger
 * /api/batches/up/{id}:
 *   patch:
 *     summary: Update a group within a batch (e.g., change name or members)
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the batch containing the group.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *                 description: The current name of the group to update.
 *                 example: "Group Alpha"
 *               newGroupName:
 *                 type: string
 *                 description: The new name for the group (optional).
 *                 example: "Group Omega"
 *               members:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: A new array of user IDs to set as members (optional).
 *                 example: [10, 15, 25]
 *     responses:
 *       200:
 *         description: Group updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Batch or Group not found.
 */
router.patch('/up/:id', authenticateToken, updateGroupInBatch);

/**
 * @swagger
 * /api/batches/{id}/groups:
 *   get:
 *     summary: Get all groups within a specific batch
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the batch.
 *     responses:
 *       200:
 *         description: An array of group objects.
 *       404:
 *         description: Batch not found.
 */
router.get('/:id/groups', getGroupsByBatchId); 

/**
 * @swagger
 * /api/batches/{id}/groups/{groupName}:
 *   get:
 *     summary: Get a specific group by name from a batch
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the batch.
 *       - in: path
 *         name: groupName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the group.
 *     responses:
 *       200:
 *         description: A single group object.
 *       404:
 *         description: Batch or Group not found.
 */
router.get('/:id/groups/:groupName', getGroupByBatchIdAndGroupName);

/**
 * @swagger
 * /api/batches/assign-instructor/batch:
 *   post:
 *     summary: Assign an instructor to an entire batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *               - userId
 *             properties:
 *               batchId:
 *                 type: integer
 *                 example: 1
 *               userId:
 *                 type: integer
 *                 description: The ID of the user (who is an instructor).
 *                 example: 5
 *     responses:
 *       200:
 *         description: Instructor assigned successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Batch or User not found.
 */
router.post('/assign-instructor/batch', authenticateToken, assignInstructorToBatch);

/**
 * @swagger
 * /api/batches/assign-instructor/group:
 *   post:
 *     summary: Assign an instructor to a specific group within a batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *               - groupName
 *               - userId
 *             properties:
 *               batchId:
 *                 type: integer
 *                 example: 1
 *               groupName:
 *                 type: string
 *                 example: "Group Alpha"
 *               userId:
 *                 type: integer
 *                 description: The ID of the user (who is an instructor).
 *                 example: 5
 *     responses:
 *       200:
 *         description: Instructor assigned successfully to group.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Batch, Group, or User not found.
 */
router.post('/assign-instructor/group', authenticateToken, assignInstructorToGroup);

/**
 * @swagger
 * /api/batches/update-instructors/group:
 *   patch:
 *     summary: Update the list of instructors for a specific group
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *               - groupName
 *               - instructorIds
 *             properties:
 *               batchId:
 *                 type: integer
 *                 example: 1
 *               groupName:
 *                 type: string
 *                 example: "Group Alpha"
 *               instructorIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: The complete new list of instructor user IDs for the group.
 *                 example: [5, 8]
 *     responses:
 *       200:
 *         description: Instructors for group updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Batch or Group not found.
 */
router.patch('/update-instructors/group', authenticateToken, updateInstructorsInGroup);

/**
 * @swagger
 * /api/batches/instructor/{userId}/batches:
 *   get:
 *     summary: Get all batches assigned to a specific instructor
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the instructor.
 *     responses:
 *       200:
 *         description: An array of batch objects assigned to the instructor.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Batch'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
router.get('/instructor/:userId/batches', authenticateToken, getBatchesForInstructor);

module.exports = router;