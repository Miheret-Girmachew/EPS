
const { AllRouters } = require('./Router'); 
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

// Load environment-specific database configuration
const env = process.env.NODE_ENV || 'development';
const configPath = path.join(__dirname, 'config', 'config.json');
let config;

try {
  const configFile = fs.readFileSync(configPath, 'utf8');
  const configData = JSON.parse(configFile);
  config = configData[env];
  // console.log('Using configuration:', config);
} catch (error) {
  console.error('Error reading config file:', error.message);
  process.exit(1);
}

const sequelize = new Sequelize(config.database, config.username, config.password, {
  ...config, // Spread in your existing configuration
  logging: console.log, // Enable logging to output SQL queries
});
// Import and initialize models
const User = require('./models/User')(sequelize, Sequelize.DataTypes);
const Batch = require('./models/Batch')(sequelize, Sequelize.DataTypes);
const Project = require('./models/Project')(sequelize, Sequelize.DataTypes);
const ProjectSubmission = require('./models/ProjectSubmission')(sequelize, Sequelize.DataTypes);

// Register associations
Batch.associate({ User });
Project.associate({ Batch });
ProjectSubmission.associate({ User, Batch, Project });

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());



// Use routes
app.use('/api', AllRouters);

// Sync database and start server
sequelize.sync({ force: false }) // force: true will drop the tables if they already exist
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err.message);
  });

module.exports = app;
