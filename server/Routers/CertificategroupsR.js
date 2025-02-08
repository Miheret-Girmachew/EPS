const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { addStudentToCertificateGroup,getCertificatedStudent,deleteCertificatedStudent } = require('../controllers/CertificateGroups');

router.post('/add', authenticateToken, addStudentToCertificateGroup);
router.get('/all', authenticateToken, getCertificatedStudent);
router.delete('/delete/:id', authenticateToken, deleteCertificatedStudent);
module.exports = router;