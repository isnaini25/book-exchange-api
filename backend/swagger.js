// const swaggerJSDoc = require('swagger-jsdoc');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = YAML.load('./docAPI.yml');

// Function to setup our docs
const swaggerDocs = (app, host) => {
  // Route-Handler to visit our docs
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  // Make our docs in JSON format available
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  return `Docs are available on ${host}/api/docs`;
};

module.exports = { swaggerDocs };
