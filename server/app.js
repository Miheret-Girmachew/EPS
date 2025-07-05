const { AllRouters } = require('./Router'); 
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

// --- SWAGGER ---: Import swagger packages
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Load environment-specific database configuration
const env = process.env.NODE_ENV || 'development';
const configPath = path.join(__dirname, 'config', 'config.json');
let config;

try {
  const configFile = fs.readFileSync(configPath, 'utf8');
  const configData = JSON.parse(configFile);
  config = configData[env];
} catch (error) {
  console.error('Error reading config file:', error.message);
  process.exit(1);
}

const sequelize = new Sequelize(config.database, config.username, config.password, {
  ...config,
  logging: false, // Set to console.log to see SQL queries
});

// Import and initialize models
const User = require('./models/User')(sequelize, Sequelize.DataTypes);
const Batch = require('./models/Batch')(sequelize, Sequelize.DataTypes);
const Project = require('./models/Project')(sequelize, Sequelize.DataTypes);
const ProjectSubmission = require('./models/ProjectSubmission')(sequelize, Sequelize.DataTypes);
// const Certificate = require('./models/Certificate')(sequelize, Sequelize.DataTypes);

// Register associations
Batch.associate({ User });
Project.associate({ Batch });
ProjectSubmission.associate({ User, Batch, Project });

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// --- SWAGGER ---: Setup Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EPS API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Exam Plagiarism System (EPS). Use this to test the endpoints.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            role: { type: 'string', enum: ['student', 'instructor', 'admin'], example: 'student' }
          }
        },
        Batch: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Computer Science 2024' },
            year: { type: 'integer', example: 2024 }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Final Year Project' },
            description: { type: 'string', example: 'Build a full-stack application.' },
            deadline: { type: 'string', format: 'date-time', example: '2024-12-31T23:59:59Z' }
          }
        },
        ProjectSubmission: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            submissionUrl: { type: 'string', description: 'URL to the submitted work', example: 'https://github.com/user/repo' },
            status: { type: 'string', enum: ['submitted', 'graded', 'late', 'needs_revision'], example: 'submitted' },
            grade: { type: 'integer', nullable: true, example: 95 },
            feedback: { type: 'string', nullable: true, example: 'Great work!' },
            userId: { type: 'integer' },
            projectId: { type: 'integer' }
          }
        },
        Certificate: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            studentId: { type: 'integer', example: 15 },
            certificateGroupId: { type: 'integer', example: 3 },
            grantedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./Routers/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve the Swagger documentation at the /api-docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use routes (place this AFTER swagger setup)
app.use('/api', AllRouters);

// Sync database and start server
sequelize.sync({ force: false })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
      console.log(`API Documentation available at http://localhost:${process.env.PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err.message);
  });

module.exports = app;