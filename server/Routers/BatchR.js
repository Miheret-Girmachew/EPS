const express = require('express');
const { 
  createBatch, 
  getBatchById, 
  getAllBatches, 
  updateBatchById, 
  deleteBatchById,
  addGroupToBatch,
  removeGroupFromBatch,
  updateGroupInBatch,
  getGroupsByBatchId, // New route
  getGroupByBatchIdAndGroupName 
} = require('../controllers/BatchC');

const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

router.post('/create', authenticateToken, createBatch);
router.get('/get/:id', getBatchById);
router.get('/all', getAllBatches);
router.patch('/update/:id', authenticateToken, updateBatchById);
router.delete('/delete/:id', authenticateToken, deleteBatchById);
router.post('/add/:id/groups', authenticateToken, addGroupToBatch);
router.delete('/:id/remove/groups', authenticateToken, removeGroupFromBatch);
router.patch('/up/:id', authenticateToken, updateGroupInBatch);
router.get('/:id/groups', getGroupsByBatchId); 
router.get('/:id/groups/:groupName', getGroupByBatchIdAndGroupName);

module.exports = router;
