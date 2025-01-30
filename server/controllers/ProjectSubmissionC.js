const {Project, ProjectSubmission, User } = require('../models');

const createProjectSubmission = async (req, res) => {
  try {
    const { project_id, github_link, deployment_link } = req.body;
    const userId = req.user.user_id;

    console.log('User ID from token:', userId);

    // Validate required fields
    if (!userId || !project_id || !github_link || !deployment_link) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Fetch the project and validate the deadline
    const project = await Project.findOne({ where: { projectId: project_id } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    console.log('Fetched project:', project);

    const currentDate = new Date();
    if (currentDate > new Date(project.projectDeadline)) {
      return res.status(403).json({ message: 'The deadline for this project has passed. Submission not allowed.' });
    }

    // Create the project submission
    const newSubmission = await ProjectSubmission.create({
      user_id: userId,
      project_id,
      github_link,
      deployment_link,
      visibility: true,
    });

    let plagiarismResponse;
    try {
      plagiarismResponse = await submitProjectForPlagiarismCheck(userId, github_link);
    } catch (error) {
      console.error('Plagiarism check error:', error);
      plagiarismResponse = { error: 'Plagiarism check failed' };
    }

    // Respond with the new submission and plagiarism check result
    res.status(201).json({ newSubmission, plagiarismResponse });

  } catch (error) {
    console.error('Detailed error:', error);

    // Log specific Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(e => ({
        message: e.message,
        path: e.path,         // Field causing the error
        type: e.type          // Type of validation error
      }));
      console.log('Validation errors:', validationErrors);
      console.error('Detailed error:', JSON.stringify(error, null, 2));

      return res.status(500).json({
        message: 'Failed to create project submission due to validation error',
        errors: validationErrors
      });
    } else if (error.response && error.response.data) {
      // Log Plagiarism API specific errors
      return res.status(500).json({
        message: 'Plagiarism API error',
        error: error.response.data
      });
    } else {
      return res.status(500).json({
        message: 'Failed to create project submission',
        error: error.message
      });
    }
  }
}


const getProjectSubmissions = async (req, res) => {
  try {
    const { userId, group, projectName } = req.query;

    // Log authenticated user for debugging
    console.log('Authenticated user:', req.user);

    // Determine the where clause based on visibility
    const whereClause = { visibility: true };

    // Use the userId from the query if provided, otherwise fallback to authenticated user's ID
    if (!userId) {
      if (!req.user || !req.user.user_id) {
        return res.status(400).json({ message: 'userId is required when not authenticated.' });
      }
      whereClause.user_id = req.user.user_id; // Use the ID from the authenticated user
    } else {
      whereClause.user_id = userId; // Use the userId from the query parameters
    }

    // Add additional filters if provided
    if (group) {
      whereClause.group = group;
    }

    if (projectName) {
      whereClause.project_name = projectName;
    }

    const submissions = await ProjectSubmission.findAll({ where: whereClause });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve project submissions', error });
  }
};


const getAllProjectSubmissions = async (req, res) => {
  try {
      // Determine the where clause based on visibility
      const whereClause = { visibility: true };

      // Add additional filters if provided
      const { group, projectName } = req.query;
      if (group) {
          whereClause.group = group;
      }
      if (projectName) {
          whereClause.project_name = projectName;
      }

      // Retrieve all submissions that match the where clause
      const submissions = await ProjectSubmission.findAll({ where: whereClause });

      // Return the submissions
      res.status(200).json(submissions);
  } catch (error) {
      console.error('Error retrieving project submissions:', error);
      res.status(500).json({ message: 'Failed to retrieve project submissions', error });
  }
};



const updateProjectSubmissionById = async (req, res) => {
  try {
    const { id: submissionId } = req.params;
    const { projectName, github_link, deployment_link } = req.body;
   

    // Find the submission
    const submission = await ProjectSubmission.findOne({ where: { psi_id: submissionId } });

    if (!submission) {
      return res.status(404).json({ message: 'Project submission not found' });
    }

    // Fetch the project to check the deadline
    const project = await Project.findOne({ where: { projectId: submission.project_id } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the update is being made before the deadline
    const currentDate = new Date();
    if (currentDate > new Date(project.projectDeadline)) {
      return res.status(403).json({ message: 'The deadline for this project has passed. Update not allowed.' });
    }

    // Ensure only students can update their own submissions
    // if (req.user.role !== '3') {
    //   return res.status(403).json({ message: 'Only students can update their own submissions' });
    // }

    // if (submission.user_id !== userId) {
    //   return res.status(403).json({ message: 'You do not have permission to update this submission' });
    // }

    if (submission.edit_count >= 2) {
      return res.status(403).json({ message: 'You have reached the maximum number of edits for this submission' });
    }

    // Proceed to update the fields
    submission.project_name = projectName || submission.project_name;
    submission.github_link = github_link || submission.github_link;
    submission.deployment_link = deployment_link || submission.deployment_link;
    submission.edit_count += 1;

    await submission.save();

    res.status(200).json({ message: 'Project submission updated successfully', submission });
  } catch (error) {
    console.error('Failed to update project submission:', error);
    res.status(500).json({ message: 'Failed to update project submission', error: error.message });
  }
};




const deleteProjectSubmissionById = async (req, res) => {
  try {

    // Check if the user is an admin
    if (req.user.role !== '1') {
      console.log('Access denied: User is not an admin');
      return res.status(403).json({ message: 'Only admins can delete project submissions' });
    }

    const { id } = req.params;

    // Fetch the submission by ID
    const submission = await ProjectSubmission.findOne({ where: { psi_id: id } });

    // Check if the submission exists
    if (!submission) {
      console.log(`Project submission with ID ${id} not found`);
      return res.status(404).json({ message: 'Project submission not found' });
    }

    // Proceed with deletion
    await submission.destroy();

    res.status(200).json({ message: 'Project submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting project submission:', error);
    res.status(500).json({ message: 'Failed to delete project submission', error: error.message });
  }
};


module.exports = {
  createProjectSubmission,
  getProjectSubmissions,
  getAllProjectSubmissions,
  updateProjectSubmissionById,
  deleteProjectSubmissionById
};
