// Router.js
const express = require('express');
const userRouter = require('./Routers/UserR'); 
const batchRouter = require('./Routers/BatchR'); 
const projectRouter = require('./Routers/ProjectR'); 
const projectSubmissionRouter = require('./Routers/ProjectSubmissionR'); 
const certificateRouter = require('./Routers/CertificateR'); 

const AllRouters = express.Router();

AllRouters.use('/users', userRouter);
AllRouters.use('/batches', batchRouter);
AllRouters.use('/projects', projectRouter);
AllRouters.use('/project-submissions', projectSubmissionRouter);
AllRouters.use('/certificates', certificateRouter); 


module.exports = { AllRouters };