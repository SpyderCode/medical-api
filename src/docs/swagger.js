const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medical Appointment API',
      version: '1.0.0',
      description: 'A REST API for managing medical appointments with secure authentication and comprehensive metrics monitoring',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      contact: {
        name: 'API Support',
        email: 'support@medappointment.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.medappointment.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token **_only_**'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              description: 'User email'
            },
            role: {
              type: 'string',
              enum: ['patient', 'doctor', 'admin'],
              description: 'User role'
            }
          }
        },
        Doctor: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Doctor ID'
            },
            name: {
              type: 'string',
              description: 'Doctor name'
            },
            specialization: {
              type: 'string',
              description: 'Medical specialization'
            },
            workingDays: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Working days of the doctor'
            },
            workingHours: {
              type: 'object',
              properties: {
                start: {
                  type: 'string',
                  description: 'Start time (HH:MM)'
                },
                end: {
                  type: 'string',
                  description: 'End time (HH:MM)'
                }
              }
            }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Appointment ID'
            },
            patient: {
              type: 'string',
              description: 'Patient ID'
            },
            doctor: {
              type: 'string',
              description: 'Doctor ID'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Appointment date'
            },
            startTime: {
              type: 'string',
              description: 'Start time (HH:MM)'
            },
            endTime: {
              type: 'string',
              description: 'End time (HH:MM)'
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'completed', 'cancelled'],
              description: 'Appointment status'
            },
            reason: {
              type: 'string',
              description: 'Reason for appointment'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Users',
        description: 'Operations about users'
      },
      {
        name: 'Doctors',
        description: 'Operations about doctors'
      },
      {
        name: 'Appointments',
        description: 'Operations about appointments'
      },
      {
        name: 'Health',
        description: 'Health and monitoring endpoints'
      }
    ],
    security: [
      {
        bearerAuth: []
      }
    ],
    externalDocs: {
      description: 'Find out more about this API',
      url: 'https://github.com/yourusername/medical-appointment-api'
    }
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
};

// Initialize swagger-jsdoc
const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerDocs;