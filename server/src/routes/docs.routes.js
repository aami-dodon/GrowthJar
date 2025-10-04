import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const router = Router();

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: "Rishi's Jar API",
      version: '0.1.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
