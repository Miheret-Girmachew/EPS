const { Batch } = require('../models');
const { User } = require('../models');  
const { Sequelize } = require('sequelize');

const createBatch = async (req, res) => {
  const { batchName } = req.body;

  try {
    const existingBatch = await Batch.findOne({ where: { batchName } });
    if (existingBatch) {
      return res.status(400).json({ message: 'Batch with the same name already exists' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Use `userId` instead of `user_id`
    const batch = await Batch.create({ 
      batchName,
      userId: req.user.userId,  // ✅ Correct field
      instructorIds: [],  
    });

    console.log('Batch created:', batch);
    res.json(batch);
  } catch (err) {
    console.error('Error occurred while creating batch:', err); 
    res.status(500).json({ 
      error: 'Internal server error', 
      details: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, 
    });
  }
};



const getBatchById = async (req, res) => {
  const { id } = req.params;

  try {
    console.log('getBatchById - Start. id:', id);
    const batch = await Batch.findOne({
      where: { batchId: id, visibility: true },
    });
    console.log('getBatchById - After fetch. batch:', batch ? batch.toJSON() : 'Batch not found');
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found or not visible' });
    }


    const responseBatch = {
      ...batch.toJSON(),
      groups: batch.groups
    }


    res.json(responseBatch);
    console.log('getBatchById - End');
  } catch (err) {
    console.log(err.message);
    res.status(500).end(err.message);
  }
};

const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.findAll({ where: { visibility: true } });
    const updatedBatches = batches.map(batch => ({
      ...batch.toJSON(),
      instructors: batch.instructors ? JSON.parse(batch.instructors) : []
    }));

    console.log(updatedBatches); // Log to see the output in the console
    res.json(updatedBatches);
  } catch (err) {
    console.log(err.message);
    res.status(500).end(err.message);
  }
};


const updateBatchById = async (req, res) => {
  const { id } = req.params;
  const { batchName, visibility } = req.body;

  try {
    const batch = await Batch.findOne({ where: { batchId: id } });

    if (batch) {
      if (batchName && batchName !== batch.batchName) {
        const existingBatch = await Batch.findOne({ where: { batchName } });
        
        if (existingBatch && existingBatch.batchId !== id) {
          return res.status(400).json({ message: 'Batch with the same name already exists' });
        }

        batch.batchName = batchName;
      }

      if (visibility !== undefined) {
        batch.visibility = visibility;
      }

      await batch.save();
      res.json(batch);
    } else {
      res.status(404).json({ message: 'Batch not found' });
    }
  } catch (err) {
    console.error('Error updating batch:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, 
    });
  }
};

const deleteBatchById = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== '1') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const batch = await Batch.findOne({ where: { batchId: id } });

    if (batch) {
      await batch.destroy();
      res.json({ message: 'Batch deleted successfully' });
    } else {
      res.status(404).json({ message: 'Batch not found' });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).end(err.message);
  }
};
const addGroupToBatch = async (req, res) => {
  const { batchId } = req.params;
  const { groups } = req.body;

  if (!batchId) {
    return res.status(400).json({ message: 'batchId is required in the URL' });
  }

  try {
    // Find the batch by batchId
    const batch = await Batch.findOne({ where: { batchId } });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Ensure that batch.groups is an array (parse it if necessary)
    let existingGroups = batch.groups;

    // If the groups are stored as a string, parse them into an array
    if (typeof existingGroups === 'string') {
      try {
        existingGroups = JSON.parse(existingGroups);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid format for groups' });
      }
    }

    // Ensure it's an array, otherwise default to an empty array
    if (!Array.isArray(existingGroups)) {
      existingGroups = [];
    }

    // Add the new groups (ensure they're not duplicates)
    groups.forEach(groupName => {
      // Check if group already exists
      if (!existingGroups.some(group => group.groupName === groupName)) {
        existingGroups.push({ groupName, instructors: [] });
      }
    });

    // Save the updated groups array back to the batch
    await batch.update({ groups: existingGroups });

    res.status(200).json({
      message: 'Group(s) added successfully',
      batchId,
      groups: existingGroups.map(g => g.groupName),
      groupCount: existingGroups.length,
    });
  } catch (err) {
    console.error('Error adding groups to batch:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};


const removeGroupFromBatch = async (req, res) => {
  const { id } = req.params;
  const { groupName } = req.body;

  if (req.user.role !== '1') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    let batch = await Batch.findOne({ where: { batchId: id } });

    if (batch) {
      console.log('Groups field value:', batch.groups);
      console.log('Groups field type:', typeof batch.groups);

      let groups;
       if (Array.isArray(batch.groups)) {
        groups = batch.groups;
      } else {
          return res.status(500).json({ error: 'Groups field is not an array' });
      }

      let updatedGroups = groups.filter(group => group.groupName !== groupName);
      batch.groups = updatedGroups;
      batch.groupCount = updatedGroups.length;

      await batch.save();
      res.json(batch);
    } else {
      res.status(404).json({ message: 'Batch not found' });
    }
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).end(err.message);
  }
};

const updateGroupInBatch = async (req, res) => {
  const { id } = req.params;
  const { groupName, newGroupName, newInstructorName } = req.body;

  if (req.user.role !== '1') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const batch = await Batch.findOne({ where: { batchId: id } });

    if (batch) {

      let groups = batch.groups;

      if (typeof groups === 'string') {
        try {
          groups = JSON.parse(groups.trim());
          console.log("Parsed groups:", groups);

          if (!Array.isArray(groups)) {
            throw new Error("Parsed groups is not an array");
          }
        } catch (error) {
          console.error("Error parsing groups:", error.message);
          return res.status(500).json({ error: 'Error parsing groups from string', details: error.message });
        }
      }
      if (Array.isArray(groups)) {
        const groupIndex = groups.findIndex(group => group.groupName === groupName);

        if (groupIndex !== -1) {
          if (newGroupName) {
            const existingGroup = groups.find(group => group.groupName === newGroupName);

            if (existingGroup && groupIndex !== groups.indexOf(existingGroup)) {
              return res.status(400).json({ message: 'Another group with the new name already exists in the batch' });
            }
          }

          groups[groupIndex].groupName = newGroupName || groups[groupIndex].groupName;
          groups[groupIndex].instructorName = newInstructorName || groups[groupIndex].instructorName;


          batch.groups = JSON.stringify(groups);
          batch.groupCount = groups.length;

          await batch.save();
          res.json(batch);
        } else {
          res.status(404).json({ message: 'Group not found' });
        }
      } else {
        console.error("Invalid groups data:", groups);
        res.status(500).json({ error: 'Internal server error: Groups is not an array' });
      }
    } else {
      res.status(404).json({ message: 'Batch not found' });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).end(err.message);
  }
};

const getGroupsByBatchId = async (req, res) => {
  const { id } = req.params;

  try {
         const batch = await Batch.findOne({ where: { batchId: id, visibility: true } });

      if (batch) {
          let groups = batch.groups;
          if (typeof groups === 'string') {
              try {
                  groups = JSON.parse(groups);
              } catch (error) {
                  return res.status(500).json({ error: 'Failed to parse groups' });
              }
          }
          res.set('Content-Type', 'application/json'); 
          res.json(groups);
      } else {
          res.status(404).json({ message: 'Batch not found or not visible' });
      }
  } catch (err) {
      console.error(err.message);
       res.status(500).json({ error: err.message }); 
  }
};

const getGroupByBatchIdAndGroupName = async (req, res) => {
  const { id, groupName } = req.params;

  try {
    const batch = await Batch.findOne({ where: { batchId: id, visibility: true } });

    if (batch) {
      let groups = batch.groups;
      if (typeof groups === 'string') {
        try {
          groups = JSON.parse(groups);
        } catch (error) {
          return res.status(500).json({ error: 'Failed to parse groups' });
        }
      }

      const group = groups.find(group => group.groupName === groupName);

      if (group) {
        res.json(group);
      } else {
        res.status(404).json({ message: 'Group not found' });
      }
    } else {
      res.status(404).json({ message: 'Batch not found or not visible' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).end(err.message);
  }
};
const assignInstructorToBatch = async (req, res) => {
  const { batchId, instructorId } = req.body;

  try {
    const instructor = await User.findOne({ where: { userId: instructorId, role: '2', visibility: true } });
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found or not authorized' });
    }

    const batch = await Batch.findOne({ where: { batchId } });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    let instructors = batch.instructors ? JSON.parse(batch.instructors) : [];
    if (!instructors.includes(instructorId)) {
      instructors.push(instructorId);
    }
    await batch.update({ instructors: JSON.stringify(instructors) });

    res.status(200).json({ message: 'Instructor assigned to batch successfully' });
  } catch (err) {
    console.error('Error assigning instructor to batch:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

const assignInstructorToGroup = async (req, res) => {
  const { batchId, groupName, instructorIds } = req.body;

  try {
    const batch = await Batch.findOne({ where: { batchId } });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    let groups = batch.groups ? JSON.parse(batch.groups) : [];

    // Ensure groups are stored as objects, convert if necessary
    if (groups.length && typeof groups[0] === "string") {
      groups = groups.map(name => ({ groupName: name, instructors: [] }));
    }

    const groupIndex = groups.findIndex(g => g.groupName === groupName);
    if (groupIndex === -1) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!groups[groupIndex].instructors) {
      groups[groupIndex].instructors = [];
    }

    let instructorNames = batch.instructorNames ? JSON.parse(batch.instructorNames) : [];

    instructorIds.forEach(instructorId => {
      if (!groups[groupIndex].instructors.includes(instructorId)) {
        groups[groupIndex].instructors.push(instructorId);
      }
      if (!instructorNames.includes(instructorId)) {
        instructorNames.push(instructorId);
      }
    });

    await batch.update({
      groups: JSON.stringify(groups),
      instructorNames: JSON.stringify(instructorNames)
    });

    res.status(200).json({ message: "Instructor assigned to group successfully" });

  } catch (err) {
    console.error("Error assigning instructor to group:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



const updateInstructorsInGroup = async (req, res) => {
  const { batchId, groupName, instructorIds } = req.body;

  try {
    const batch = await Batch.findOne({ where: { batchId } });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    let groups = batch.groups ? JSON.parse(batch.groups) : [];
    const groupIndex = groups.findIndex(g => g.groupName === groupName);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!groups[groupIndex].instructors) {
      groups[groupIndex].instructors = [];
    }

    // Ensure all instructor IDs are valid
    const validInstructors = await User.findAll({ where: { userId: instructorIds, role: '2', visibility: true } });
    const validInstructorIds = validInstructors.map(inst => inst.userId);

    // Update instructors list
    groups[groupIndex].instructors = validInstructorIds;

    await batch.update({ groups: JSON.stringify(groups) });
    res.status(200).json({ message: 'Instructors updated in group successfully' });
  } catch (err) {
    console.error('Error updating instructors in group:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

const getBatchesForInstructor = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch batches where this instructor is assigned using JSON_CONTAINS function in MariaDB
    const batches = await Batch.findAll({
      where: Sequelize.literal(`JSON_CONTAINS(instructorIds, '["${userId}"]')`),
    });

    if (!batches || batches.length === 0) {
      return res.status(404).json({ message: 'No batches found for this instructor.' });
    }

    // Optionally, format batches or remove sensitive data before sending it in the response
    const batchData = batches.map(batch => batch.get({ plain: true }));

    res.json({ batches: batchData });
  } catch (error) {
    console.error("Error fetching batches for instructor:", error);
    res.status(500).json({ message: "Failed to fetch batches", error: error.message });
  }
};


module.exports = {
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
};
