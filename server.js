// Loads the configuration from config.env to process.env
require('dotenv').config({ path: './config.env' });

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// get MongoDB driver connection
const dbo = require('./db/conn');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestión de Tareas',
      version: '1.0.0',
      description: 'API para gestionar tareas con MongoDB'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo'
      }
    ],
  },
  apis: ['./routes/record.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use(require('./routes/record'));

// Global error handling
app.use(function (err, _req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Solo iniciar servidor si no estamos en testing
if (process.env.NODE_ENV !== 'test') {
  dbo.connectToServer(function (err) {
    if (err) {
      console.error(err);
      process.exit();
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      console.log(`Swagger documentation available at: http://localhost:${PORT}/api-docs`);
    });
  });
}

// Exportar app para testing
module.exports = app;