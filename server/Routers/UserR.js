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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication.
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: janedoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Str0ngP@ssw0rd!
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *                 example: student
 *     responses:
 *       201:
 *         description: User created successfully. Returns the user object and a JWT.
 *       400:
 *         description: Bad request (e.g., email already in use).
 */
router.post('/register', createUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate a user and get a JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Str0ngP@ssw0rd!
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JSON Web Token for authentication.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, invalid credentials.
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the user.
 *     responses:
 *       200:
 *         description: User data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to update.
 *     requestBody:
 *       description: Fields to update. User can update their own info. Admin can update anyone's.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (trying to update another user's info without admin rights).
 *       404:
 *         description: User not found.
 */
router.patch('/:id', authenticateToken, updateUserById);

/**
 * @swagger
 * /api/users/vis/{id}:
 *   patch:
 *     summary: Update user visibility (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user whose visibility to change.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isVisible:
 *                 type: boolean
 *                 description: Set to true if the user should be visible, false otherwise.
 *     responses:
 *       200:
 *         description: User visibility updated.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (not an admin).
 *       404:
 *         description: User not found.
 */
router.patch('/vis/:id', authenticateToken, updateUserVisibilityByAdmin);

/**
 * @swagger
 * /api/users/request-password-reset:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.doe@example.com
 *     responses:
 *       200:
 *         description: If a user with that email exists, a reset email will be sent.
 *       404:
 *         description: User with that email not found.
 */
router.post('/request-password-reset', requestPasswordReset);

/**
 * @swagger
 * /api/users/reset-password/{token}:
 *   post:
 *     summary: Reset password using a token from email
 *     tags: [Users]
 *     description: This endpoint consumes the token sent via email and sets a new password. The method is POST for security.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The password reset token from the email link.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The new password for the user.
 *                 example: NewStr0ngP@ss!
 *     responses:
 *       200:
 *         description: Password has been reset successfully.
 *       400:
 *         description: Bad request (e.g., token is invalid or expired).
 */
// NOTE: For this route to work as documented, you must change it from GET to POST.
router.post('/reset-password/:token', resetPassword); 
// The original was: router.get('/reset-password/:token', resetPassword);

/**
 * @swagger
 * /api/users/submission:
 *   post:
 *     summary: Update a student's submission status (Admin/Instructor)
 *     tags: [Users]
 *     description: Ambiguous route. Assuming it's for an admin/instructor to update a submission status for a student.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: integer
 *               submissionId:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated.
 *       401:
 *         description: Unauthorized.
 */
router.post('/submission', authenticateToken, updateStudentSubmissionStatus);

/**
 * @swagger
 * /api/users/students:
 *   get:
 *     summary: Get all users with the 'student' role
 *     tags: [Users]
 *     description: Retrieves a list of all students. This endpoint uses GET, which is the standard for data retrieval.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of student users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 */
// NOTE: For this route to work as documented, you must change it from POST to GET.
router.get('/students', authenticateToken, getAllStudents);
// The original was: router.post('/students', getAllStudents);

/**
 * @swagger
 * /api/users/instructors:
 *   get:
 *     summary: Get all users with the 'instructor' role
 *     tags: [Users]
 *     description: Retrieves a list of all instructors. This endpoint uses GET, which is the standard for data retrieval.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of instructor users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 */
// NOTE: For this route to work as documented, you must change it from POST to GET.
router.get('/instructors', authenticateToken, getAllInstructors);
// The original was: router.post('/instructors', getAllInstructors);

module.exports = router;