import request from 'supertest';
import app from '../app';

describe('App', () => {
  it('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');

    expect(response.status).toBe(404);
  });

  it('should handle JSON parsing errors', async () => {
    const response = await request(app)
      .post('/api/analysis/analyze')
      .set('Content-Type', 'application/json')
      .send('invalid json');

    expect(response.status).toBe(400);
  });

  it('should handle CORS', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://example.com');

    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('should use helmet security headers', async () => {
    const response = await request(app).get('/');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  });
}); 