const { Project, Batch } = require('../models');

const createProject = async (req, res) => {
  const { projectName, projectDeadline, batchId, visibility } = req.body;

  try {
    // Check if the user is an admin
    if (req.user.role !== "1") {
      return res.status(403).json({ message: 'Only admins can create projects' });
    }

    // Check if the batch exists
    const batch = await Batch.findOne({ where: { batchId } });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if a project with the same name already exists within the same batch
    const existingProject = await Project.findOne({ where: { projectName, batchId: batch.batchId } });
    if (existingProject) {
      return res.status(400).json({ message: 'Project with the same name already exists in this batch' });
    }

    // Create the new project
    const newProject = await Project.create({
      projectName,
      projectDeadline,
      batchId: batch.batchId,
      visibility: visibility !== undefined ? visibility : true, // Default to true if not provided
    });

    // Send the newly created project as a response
    res.status(200).json(newProject);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Failed to create project', error });
  }
};

const getProjects = async (req, res) => {
  const { id } = req.params; 

  try {
    const projects = await Project.findAll({
      where: {
        batchId: id, 
        visibility: true, 
      },
    });

    
    if (!projects.length) {
      return res.status(200).json([]); 
    }

    
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error details:', error); 
    res.status(500).json({ message: 'Failed to retrieve projects', error: error.message });
  }
};




const getProjectById = async (req, res) => { 
  const { id } = req.params;

  try {
    const project = await Project.findOne({ where: { projectId: id, visibility: true } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or not visible' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Failed to retrieve project', error });
  }
};

const updateProjectById = async (req, res) => {
  const { id } = req.params;
  const { projectName, projectDeadline, batchId, visibility } = req.body;

  try {
    // Find the project by its ID
    const project = await Project.findOne({ where: { projectId: id } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if a new batchId is provided and ensure the batch exists
    if (batchId) {
      const batch = await Batch.findOne({ where: { batchId } });
      if (!batch) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      project.batchId = batch.batchId; // Update the batch ID
    }

    // Check if the new project name already exists in the same batch
    if (projectName && projectName !== project.projectName) {
      const existingProject = await Project.findOne({
        where: { projectName, batchId: project.batchId }
      });

      // Prevent updating if the name already exists
      if (existingProject && existingProject.projectId !== project.projectId) {
        return res.status(400).json({ message: 'A project with this name already exists in the batch' });
      }
      project.projectName = projectName; // Update the project name
    }

    // Update remaining fields
    project.projectDeadline = projectDeadline !== undefined ? projectDeadline : project.projectDeadline;
    project.visibility = visibility !== undefined ? visibility : project.visibility;

    // Log the project before saving
    console.log('Project to be updated:', project);

    // Attempt to save the updated project
    const savedProject = await project.save();
    console.log('Saved project:', savedProject);

    res.status(200).json(savedProject); // Send the updated project as a response
  } catch (error) {
    console.error('Error updating project:', error); // More detailed error logging
    res.status(500).json({ message: 'Failed to update project' });
  }
};



const deleteProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findOne({ where: { projectId: id } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== '1') {
      return res.status(403).json({ message: 'Only admins can delete projects' });
    }

    await project.destroy();
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Failed to delete project', error });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById
};
