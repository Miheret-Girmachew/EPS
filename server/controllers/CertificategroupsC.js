const {  CertificateGroups } = require('../models');

const addStudentToCertificateGroup = async (req, res) => {
  try {
    const { studentId } = req.body;
    console.log("Adding student to certificate group", studentId);
    // Check if the user is an instructor (role 2)
    if (req.user.role !== '2') {
      return res.status(403).json({ message: 'Only instructors can add students to certificate group' });
    }
    const student = await User.findOne({ where: { userId: studentId } });
    if (!student) { 
        return res.status(404).json({ message: 'student not found' });
      }
    // Create new entry
    const entry = await CertificateGroups.create({user_id : studentId});

    res.status(200).json({ message: 'student is in the certificate group'});

  } catch (error) {
    console.error('Error adding student to group:', error);
    res.status(500).json({ message: 'Failed to add student to group', error: error.message });
  }
};
const getCertificatedStudent = async (req, res) => {
  try {
    const entry = await CertificateGroups.findAll();
    console.log("Getting certificate group", entry);

    res.status(200).json({message: "all the certificate users",entry});

  } catch (error) {
    console.error('Error getting the groups', error);
    res.status(500).json({ message: 'Error finding certificated users to group', error: error.message });
  }
};

const deleteCertificatedStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the submission by ID
    const submission = await CertificateGroups.findOne({ where: { c_id: id } });

    // Check if the submission exists
    if (!submission) {
      console.log(`Project submission with ID ${id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Proceed with deletion
    await submission.destroy();

    res.status(200).json({ message: 'User was deleted' });

  } catch (error) {
    console.error('Error deleting certificate group user', error);
    res.status(500).json({ message: 'Error finding certificated users to group', error: error.message });
  }
};

module.exports = {
  addStudentToCertificateGroup,
  getCertificatedStudent,
  deleteCertificatedStudent
};