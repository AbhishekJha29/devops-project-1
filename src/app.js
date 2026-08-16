const express = require('express');

const app = express();

app.use(express.json());

// Main route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello from CI/CD Pipeline Demo App',
    version: '1.0.0'
  });
});

// Health check route for liveness/readiness probes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

module.exports = app;
