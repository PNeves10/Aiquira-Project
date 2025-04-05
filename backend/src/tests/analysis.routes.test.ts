import request from 'supertest';
import express from 'express';
import analysisRoutes from '../routes/analysis.routes';

describe('Analysis Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analysis', analysisRoutes);
  });

  describe('POST /api/analysis/analyze', () => {
    it('should return 200 when property data is valid', async () => {
      const validPropertyData = {
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        propertyCondition: {
          age: 10,
          maintenanceHistory: []
        },
        financial: {
          marketValue: 500000,
          rentalIncome: 3000
        }
      };

      const response = await request(app)
        .post('/api/analysis/analyze')
        .send(validPropertyData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 400 when property data is invalid', async () => {
      const invalidPropertyData = {
        location: {
          address: '123 Main St'
        }
      };

      const response = await request(app)
        .post('/api/analysis/analyze')
        .send(invalidPropertyData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/analysis/risk-score', () => {
    it('should return 200 when property data is valid', async () => {
      const validPropertyData = {
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        propertyCondition: {
          age: 10,
          maintenanceHistory: []
        },
        financial: {
          marketValue: 500000,
          rentalIncome: 3000
        }
      };

      const response = await request(app)
        .post('/api/analysis/risk-score')
        .send(validPropertyData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 400 when property data is invalid', async () => {
      const invalidPropertyData = {
        location: {
          address: '123 Main St'
        }
      };

      const response = await request(app)
        .post('/api/analysis/risk-score')
        .send(invalidPropertyData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/analysis/issues', () => {
    it('should return 200 when property data is valid', async () => {
      const validPropertyData = {
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        propertyCondition: {
          age: 10,
          maintenanceHistory: []
        },
        financial: {
          marketValue: 500000,
          rentalIncome: 3000
        }
      };

      const response = await request(app)
        .post('/api/analysis/issues')
        .send(validPropertyData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 400 when property data is invalid', async () => {
      const invalidPropertyData = {
        location: {
          address: '123 Main St'
        }
      };

      const response = await request(app)
        .post('/api/analysis/issues')
        .send(invalidPropertyData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/analysis/recommendations', () => {
    it('should return 200 when property data is valid', async () => {
      const validPropertyData = {
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        propertyCondition: {
          age: 10,
          maintenanceHistory: []
        },
        financial: {
          marketValue: 500000,
          rentalIncome: 3000
        }
      };

      const response = await request(app)
        .post('/api/analysis/recommendations')
        .send(validPropertyData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 400 when property data is invalid', async () => {
      const invalidPropertyData = {
        location: {
          address: '123 Main St'
        }
      };

      const response = await request(app)
        .post('/api/analysis/recommendations')
        .send(invalidPropertyData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 