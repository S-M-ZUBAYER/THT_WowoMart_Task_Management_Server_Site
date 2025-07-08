// swaggerConfig.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Wowomart Management & Task Management System API',
            version: '1.0.0',
            description: `API documentation for Wowomart Management System and THT Task Management System.

**Developer Info:**
- **Name**: S M Zubayer  
- **Designation**: Software Engineer  
- **Position**: Team Leader  
- **Email**: smzubayer9004@gmail.com`,
            contact: {
                name: 'S M Zubayer',
                email: 'smzubayer9004@gmail.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/tht',
                description: 'Local development server',
            },
        ],
        tags: [ // ✅ Tags must be inside 'definition'
            {
                name: 'User',
                description: 'APIs for managing Users',
            },
            {
                name: 'Projects',
                description: 'APIs for managing all projects',
            },
            {
                name: 'Task',
                description: 'APIs for managing all tasks under a project',
            },
            {
                name: 'Attachment',
                description: 'APIs for managing attachment file of task',
            },
            {
                name: 'ResourceFiles',
                description: 'APIs for managing resource file of task',
            },
            {
                name: 'TaskDiscussion',
                description: 'APIs for managing all discussion for particular task',
            },
            {
                name: 'ProjectBug',
                description: 'APIs for managing all bugs under a task',
            },
            {
                name: 'Bug',
                description: 'APIs for managing all bugs under a task',
            },
            {
                name: 'TestReports',
                description: 'APIs for managing all test of a task after checking',
            },
            {
                name: 'Notifications',
                description: 'APIs for user notifications',
            },
            {
                name: 'DailyTaskReport',
                description: 'APIs for managing individual employees daily task report',
            }
        ]
    },
    apis: ['./TaskManagement/routes/*.js'], // Path to your route files with Swagger annotations
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
