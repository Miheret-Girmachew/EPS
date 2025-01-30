const { Project, ProjectSubmission, User } = require('../models');

const createProjectSubmission = async (req, res) => {
  try {
    console.log("createProjectSubmission function called");

    // Log the full request body for debugging
    console.log("Received request body:", req.body);

    // Log the authenticated user information
    console.log("User from req.user:", req.user);

    // Extracting user_id from authenticated user
    const { user_id } = req.user; // Ensure user_id is set in JWT payload

    // Log the extracted user_id
    console.log("Extracted user_id from req.user:", user_id);

    // Extract fields from request body
    const { batch_id, project_id, github_link, deployment_link, group } = req.body;

    // Log extracted fields
    console.log("Extracted fields:");
    console.log("user_id:", user_id);
    console.log("batch_id:", batch_id);
    console.log("project_id:", project_id);
    console.log("github_link:", github_link);
    console.log("deployment_link:", deployment_link);
    console.log("group:", group);

    // Validate required fields
    if (!user_id || !batch_id || !project_id || !github_link || !deployment_link || !group) {
      console.error("Missing fields:", {
        user_id,
        batch_id,
        project_id,
        github_link,
        deployment_link,
        group
      });
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch the project and validate the deadline
    console.log("Fetching project with ID:", project_id);
    const project = await Project.findOne({ where: { projectId: project_id } });

    if (!project) {
      console.error("Project not found for ID:", project_id);
      return res.status(404).json({ message: "Project not found" });
    }

    console.log("Fetched project:", project);

    const currentDate = new Date();
    console.log("Current date:", currentDate);
    console.log("Project deadline:", project.projectDeadline);
    if (currentDate > new Date(project.projectDeadline)) {
      console.error("Deadline has passed for project:", project.projectDeadline);
      return res.status(403).json({
        message: "The deadline for this project has passed. Submission not allowed."
      });
    }

    // Check if the user has already submitted for this project
    console.log("Checking for existing submission for user:", user_id, "and project:", project_id);
    const existingSubmission = await ProjectSubmission.findOne({
      where: { user_id, project_id }
    });

    if (existingSubmission) {
      console.error("Duplicate submission detected for user:", user_id);
      return res.status(409).json({
        message: "You have already submitted this project."
      });
    }

    // Create the project submission
    console.log("Creating new project submission");
    const newSubmission = await ProjectSubmission.create({
      user_id,
      batch_id,
      project_id,
      github_link,
      deployment_link,
      group,
      visibility: true
    });

    console.log("Project submitted successfully:", newSubmission);

    // Respond with the new submission
    return res.status(201).json({
      message: "Project submitted successfully!",
      newSubmission
    });

  } catch (error) {
    console.error("Detailed error:", error);

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map(e => ({
        message: e.message,
        field: e.path,
        type: e.type
      }));

      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors
      });
    } else if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Foreign key constraint error. Make sure user, batch, and project exist.",
        error: error.message
      });
    } else {
      return res.status(500).json({
        message: "Failed to create project submission",
        error: error.message
      });
    }
  }
};



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
