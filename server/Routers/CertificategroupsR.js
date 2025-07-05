const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { addStudentToCertificateGroup, getCertificatedStudent, deleteCertificatedStudent } = require('../controllers/CertificateGroups');

/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: API for managing student certifications.
 */

/**
 * @swagger
 * /api/certificates/add:
 *   post:
 *     summary: Add a student to a certificate group
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - certificateGroupId
 *             properties:
 *               studentId:
 *                 type: integer
 *                 description: The ID of the student to be certificated.
 *                 example: 15
 *               certificateGroupId:
 *                 type: integer
 *                 description: The ID of the certificate or group they are being added to.
 *                 example: 3
 *     responses:
 *       201:
 *         description: Student added to certificate group successfully.
 *       400:
 *         description: Bad request (e.g., student already in group).
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Student or Certificate Group not found.
 */
router.post('/add', authenticateToken, addStudentToCertificateGroup);

/**
 * @swagger
 * /api/certificates/all:
 *   get:
 *     summary: Get all certificated students
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all certificated students.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique ID of the certification entry.
 *                     example: 1
 *                   studentId:
 *                     type: integer
 *                     example: 15
 *                   certificateGroupId:
 *                     type: integer
 *                     example: 3
 *                   grantedAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the certificate was granted.
 *       401:
 *         description: Unauthorized.
 */
router.get('/all', authenticateToken, getCertificatedStudent);

/**
 * @swagger
 * /api/certificates/delete/{id}:
 *   delete:
 *     summary: Delete a student's certification record by its ID
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the certification record to delete.
 *     responses:
 *       200:
 *         description: Certification record deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Certification record not found.
 */
router.delete('/delete/:id', authenticateToken, deleteCertificatedStudent);

module.exports = router;