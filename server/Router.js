// Router.js
const express = require('express');
const userRouter = require('./Routers/UserR'); 
const batchRouter = require('./Routers/BatchR'); 
const projectRouter = require('./Routers/ProjectR'); 
const plagarism = require('./Routers/plagiarism'); 
const projectSubmissionRouter = require('./Routers/ProjectSubmissionR'); 

const AllRouters = express.Router();

AllRouters.use('/users', userRouter);

AllRouters.use('/batches', batchRouter);

AllRouters.use('/projects', projectRouter);
AllRouters.use('/plagarism', plagarism);

AllRouters.use('/project-submissions', projectSubmissionRouter);

module.exports = { AllRouters };
