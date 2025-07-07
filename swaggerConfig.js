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
- **Email**: smzubayer9004@gmail.com  
- **Portfolio**: https://s-m-zubayer-portfolio.netlify.app`,
            contact: {
                name: 'S M Zubayer',
                email: 'smzubayer9004@gmail.com',
                url: 'https://s-m-zubayer-portfolio.netlify.app',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/tht',
                description: 'Local development server',
            },
        ],
    },
    apis: ['./TaskManagement/routes/*.js'],
};



const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
