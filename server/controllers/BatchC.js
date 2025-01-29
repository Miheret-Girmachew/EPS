const { Batch } = require('../models');

const createBatch = async (req, res) => {
  const { batchName } = req.body;

  // Role check (assuming '1' is the admin role)
  // if (req.user.role !== '1') {
  //   return res.status(403).json({ error: 'Access denied' });
  // }

  try {
    // Check if a batch with the same name already exists
    const existingBatch = await Batch.findOne({ where: { batchName } });
    if (existingBatch) {
      return res.status(400).json({ message: 'Batch with the same name already exists' });
    }

    // If no existing batch, create a new one
    const batch = await Batch.create({ 
      batchName,
      user_id: req.user.user_id, // Assuming this comes from authenticated user
    });
    
    console.log('Batch created:', batch);
    res.json(batch);
  } catch (err) {
    console.error('Error occurred while creating batch:', err); // Log the error
    res.status(500).json({ 
      error: 'Internal server error', 
      details: err.message, // Include the error message
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Include stack trace if in development
    });
  }
};



const getBatchById = async (req, res) => {
  const { id } = req.params;

  try {
    const batch = await Batch.findOne({ where: { batchId: id, visibility: true } }); // only his students for the teacher 

    if (batch) {
      res.json(batch);
    } else {
      res.status(404).json({ message: 'Batch not found or not visible' });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).end(err.message);
  }
};

const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.findAll({ where: { visibility: true } });
    res.json(batches);
  } catch (err) {
    console.log(err.message);
    res.status(500).end(err.message);
  }
};

const updateBatchById = async (req, res) => {
  const { id } = req.params;
  const { batchName, visibility } = req.body;

  // Check if the user is an admin
  // if (req.user.role !== '1') {
  //   return res.status(403).json({ error: 'Access denied' });
  // }

  try {
    // Find the batch by its ID
    const batch = await Batch.findOne({ where: { batchId: id } });

    if (batch) {
      // If a new batch name is provided, check if it is already used by another batch
      if (batchName && batchName !== batch.batchName) {
        const existingBatch = await Batch.findOne({ where: { batchName } });
        
        // If the new name exists in another batch, return an error
        if (existingBatch && existingBatch.batchId !== id) {
          return res.status(400).json({ message: 'Batch with the same name already exists' });
        }

        // Otherwise, update the batch name
        batch.batchName = batchName;
      }

      // Update the visibility field if provided
      if (visibility !== undefined) {
        batch.visibility = visibility;
      }

      // Save the updated batch
      await batch.save();
      res.json(batch);
    } else {
      res.status(404).json({ message: 'Batch not found' });
    }
  } catch (err) {
    console.error('Error updating batch:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message, // Include error details for debugging
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Include stack trace if in development
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
  const { id } = req.params;
  const { groupName } = req.body; // Removed instructorName from destructuring

  // Check if the user is an admin
  if (req.user.role !== '1') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Validate the input
  if (!groupName) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  try {
    // Find the batch by batchId
    const batch = await Batch.findOne({ where: { batchId: id } });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Ensure groups is an array (instead of storing as a JSON string)
    let groups = batch.groups;

    if (!Array.isArray(groups)) {
      groups = []; // If groups is null, initialize it as an array
    }

    // Check if a group with the same name already exists
    const existingGroup = groups.find(group => group.groupName === groupName);
    if (existingGroup) {
      return res.status(400).json({ message: 'Group with the same name already exists in the batch' });
    }

    // Add the new group to the array
    const newGroup = { groupName };
    groups.push(newGroup);

    // Update the batch with the new groups and group count
    batch.groups = groups; // Store as an array in the database
    batch.groupCount = groups.length;

    // Save the updated batch
    await batch.save();

    return res.json({
      message: 'Group added successfully',
      batchId: batch.batchId,
      groups: batch.groups, // Return the updated groups array
      groupCount: batch.groupCount,
    });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'An error occurred while adding the group' });
  }
};




const removeGroupFromBatch = async (req, res) => {
  const { id } = req.params;
  const { groupName } = req.body;

  // Check if the user has the right role
  if (req.user.role !== '1') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    // Find the batch by batchId
    let batch = await Batch.findOne({ where: { batchId: id } });

    if (batch) {
      // Log the type and value of the groups field
      console.log('Groups field value:', batch.groups);
      console.log('Groups field type:', typeof batch.groups);

      // Ensure groups is an array
      let groups;
      if (typeof batch.groups === 'string') {
        try {
          groups = JSON.parse(batch.groups); // Parse if it's a JSON string
        } catch (error) {
          return res.status(500).json({ error: 'Failed to parse groups' });
        }
      } else if (Array.isArray(batch.groups)) {
        groups = batch.groups;
      } else {
        // Log an error if groups is not an array
        console.error('Groups field is not an array:', batch.groups);
        return res.status(500).json({ error: 'Groups field is not an array' });
      }

      // Filter out the group that should be removed
      let updatedGroups = groups.filter(group => group.groupName !== groupName);

      // Update the batch fields
      batch.groups = JSON.stringify(updatedGroups); // Store as a JSON string
      batch.groupCount = updatedGroups.length; // Update the group count

      // Save the updated batch
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

  // Check if the user is an admin
  if (req.user.role !== '1') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    // Find the batch by batchId
    const batch = await Batch.findOne({ where: { batchId: id } });

    if (batch) {

      let groups = batch.groups;

      // Check if groups is a string and attempt to parse it
      if (typeof groups === 'string') {
        try {
          // Trim and parse the JSON string to an array
          groups = JSON.parse(groups.trim());
          console.log("Parsed groups:", groups);

          // Ensure that the parsed data is an array
          if (!Array.isArray(groups)) {
            throw new Error("Parsed groups is not an array");
          }
        } catch (error) {
          console.error("Error parsing groups:", error.message);
          return res.status(500).json({ error: 'Error parsing groups from string', details: error.message });
        }
      }

      // Proceed if groups is an array
      if (Array.isArray(groups)) {
        const groupIndex = groups.findIndex(group => group.groupName === groupName);

        // Check if the group to be updated exists
        if (groupIndex !== -1) {
          // Check if the new group name already exists in the batch (for another group)
          if (newGroupName) {
            const existingGroup = groups.find(group => group.groupName === newGroupName);

            if (existingGroup && groupIndex !== groups.indexOf(existingGroup)) {
              return res.status(400).json({ message: 'Another group with the new name already exists in the batch' });
            }
          }

          // Update the group details
          groups[groupIndex].groupName = newGroupName || groups[groupIndex].groupName;
          groups[groupIndex].instructorName = newInstructorName || groups[groupIndex].instructorName;

          // Save the updated groups as JSON
          batch.groups = JSON.stringify(groups);
          batch.groupCount = groups.length; // Update the group count

          // Save the updated batch
          await batch.save();
          res.json(batch);
        } else {
          // Group not found
          res.status(404).json({ message: 'Group not found' });
        }
      } else {
        // Log the invalid groups data for debugging
        console.error("Invalid groups data:", groups);

        // If groups is not an array after parsing, return an error
        res.status(500).json({ error: 'Internal server error: Groups is not an array' });
      }
    } else {
      // Batch not found
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
      // Find the batch by batchId
      const batch = await Batch.findOne({ where: { batchId: id, visibility: true } });

      if (batch) {
          // Parse groups if necessary and return
          let groups = batch.groups;
          if (typeof groups === 'string') {
              try {
                  groups = JSON.parse(groups);
              } catch (error) {
                  return res.status(500).json({ error: 'Failed to parse groups' });
              }
          }
          res.set('Content-Type', 'application/json'); // Optional: Set content type
          // Respond with the groups
          res.json(groups);
      } else {
          res.status(404).json({ message: 'Batch not found or not visible' });
      }
  } catch (err) {
      console.error(err.message);
       res.status(500).json({ error: err.message }); //Improved error handling.
  }
};

const getGroupByBatchIdAndGroupName = async (req, res) => {
  const { id, groupName } = req.params;

  try {
    // Find the batch by batchId
    const batch = await Batch.findOne({ where: { batchId: id, visibility: true } });

    if (batch) {
      // Parse groups if necessary
      let groups = batch.groups;
      if (typeof groups === 'string') {
        try {
          groups = JSON.parse(groups);
        } catch (error) {
          return res.status(500).json({ error: 'Failed to parse groups' });
        }
      }

      // Find the specific group by name
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





module.exports = {
  createBatch,
  getBatchById,
  getAllBatches,
  updateBatchById,
  deleteBatchById,
  addGroupToBatch,
  removeGroupFromBatch,
  updateGroupInBatch,
  getGroupsByBatchId, // New function
  getGroupByBatchIdAndGroupName // New function
};
