const request = require('supertest');
const app = require('../src/app');

describe('App Endpoints', () => {
  describe('GET /', () => {
    it('should return status 200 and expected message', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        message: 'Hello from CI/CD Pipeline Demo App',
        version: '1.0.0'
      });
    });
  });

  describe('GET /health', () => {
    it('should return status 200 and status ok', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        status: 'ok'
      });
    });
  });
});
