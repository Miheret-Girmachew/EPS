const { Project, ProjectSubmission, User } = require('../models');

const createProjectSubmission = async (req, res) => {
  try {
    console.log("createProjectSubmission function called");

    // Log the full request body for debugging
    console.log("Received request body:", req.body);

    // Log the authenticated user information
    console.log("User from req.user:", req.user);

    // Extracting user_id from request body (NOT req.user)
    const { user_id } = req.body; // ENSURE the JWT token middleware IS POPULATING REQ.USER

    // Log the extracted user_id
    console.log("Extracted user_id from req.body:", user_id);

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
      if (!req.user || !req.user.userId) { // Access userId DIRECTLY from req.user
        return res.status(400).json({ message: 'userId is required when not authenticated.' });
      }
      whereClause.user_id = req.user.userId; // Use the ID from the authenticated user
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
    console.log("updateProjectSubmissionById function called");

    // Extract authenticated user ID
    const { userId } = req.user;  // Access userId directly from req.user
    console.log("Authenticated user ID:", userId);

    // Extract submission ID from params
    const { id: submissionId } = req.params;
    console.log("Submission ID from params:", submissionId);

    // Extract fields from request body
    const { projectName, github_link, deployment_link } = req.body;
    console.log("Received fields:", { projectName, github_link, deployment_link });

    // Validate required fields
    if (!projectName || !github_link || !deployment_link) {
      console.error("Missing fields:", { projectName, github_link, deployment_link });
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the submission
    const submission = await ProjectSubmission.findOne({ where: { psi_id: submissionId } });

    if (!submission) {
      console.error("Project submission not found for ID:", submissionId);
      return res.status(404).json({ message: "Project submission not found" });
    }

    console.log("Fetched submission:", submission);

    // Ensure only the owner can update their submission
    if (submission.user_id !== userId) {
      console.error("Unauthorized update attempt by user:", userId);
      return res.status(403).json({ message: "You do not have permission to update this submission" });
    }

    // Fetch the project to check the deadline
    const project = await Project.findOne({ where: { projectId: submission.project_id } });

    if (!project) {
      console.error("Project not found for ID:", submission.project_id);
      return res.status(404).json({ message: "Project not found" });
    }

    console.log("Fetched project:", project);

    // Validate deadline
    const currentDate = new Date();
    if (currentDate > new Date(project.projectDeadline)) {
      console.error("Project deadline has passed. Update not allowed.");
      return res.status(403).json({ message: "The deadline for this project has passed. Update not allowed." });
    }

    // Enforce edit count limit
    if (submission.edit_count >= 2) {
      console.error("Edit limit reached for submission ID:", submissionId);
      return res.status(403).json({ message: "You have reached the maximum number of edits for this submission" });
    }

    // Update submission fields
    submission.project_name = projectName;
    submission.github_link = github_link;
    submission.deployment_link = deployment_link;
    submission.edit_count += 1; // Increment edit count

    await submission.save();

    console.log("Project submission updated successfully:", submission);

    return res.status(200).json({ message: "Project submission updated successfully", submission });

  } catch (error) {
    console.error("Failed to update project submission:", error);

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
    } else {
      return res.status(500).json({
        message: "Failed to update project submission",
        error: error.message
      });
    }
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

const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the status value
    if (!['well done', 'has problems'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Check if the user is an instructor (role 2)
    if (req.user.role !== '2') {
      return res.status(403).json({ message: 'Only instructors can update submission status' });
    }

    // Find the submission by ID
    const submission = await ProjectSubmission.findOne({ where: { psi_id: id } });

    if (!submission) {
      return res.status(404).json({ message: 'Project submission not found' });
    }

    // Update the submission status
    submission.status = status;
    await submission.save();

    res.status(200).json({ message: 'Submission status updated successfully', submission });
  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({ message: 'Failed to update submission status', error });
  }
};

module.exports = {
  createProjectSubmission,
  getProjectSubmissions,
  getAllProjectSubmissions,
  updateProjectSubmissionById,
  deleteProjectSubmissionById,
  updateSubmissionStatus // Export the new function
};