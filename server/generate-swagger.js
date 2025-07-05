// generate-swagger.js

const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config(); // Make sure environment variables are loaded

// This is the EXACT SAME options object from your app.js
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
              submissionUrl: { type: 'string', example: 'https://github.com/user/repo' },
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

const outputPath = path.join(__dirname, 'swagger.json');

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`Swagger JSON specification has been generated at: ${outputPath}`);