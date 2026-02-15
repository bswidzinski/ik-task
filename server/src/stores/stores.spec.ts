import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  createStore,
  createProduct,
  clearDatabase,
} from '../test-utils';

describe('Stores API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(app);
  });

  describe('GET /api/stores', () => {
    it('should return empty array when no stores', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/stores')
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return all stores', async () => {
      await createStore(app, { name: 'Store A', address: 'Addr A' });
      await createStore(app, { name: 'Store B', address: 'Addr B' });

      const res = await request(app.getHttpServer())
        .get('/api/stores')
        .expect(200);

      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /api/stores/:id', () => {
    it('should return a store by id', async () => {
      const store = await createStore(app, {
        name: 'My Store',
        address: '456 Main St',
      });

      const res = await request(app.getHttpServer())
        .get(`/api/stores/${store.id}`)
        .expect(200);

      expect(res.body.name).toBe('My Store');
      expect(res.body.address).toBe('456 Main St');
    });

    it('should return 404 for non-existent store', async () => {
      await request(app.getHttpServer())
        .get('/api/stores/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /api/stores', () => {
    it('should create a store with valid data', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/stores')
        .send({ name: 'New Store', address: '789 Elm St' })
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'New Store',
        address: '789 Elm St',
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/api/stores')
        .send({ name: '' })
        .expect(400);
    });

    it('should return 400 when name is too short', async () => {
      await request(app.getHttpServer())
        .post('/api/stores')
        .send({ name: 'A', address: '123 St' })
        .expect(400);
    });
  });

  describe('PATCH /api/stores/:id', () => {
    it('should update a store', async () => {
      const store = await createStore(app);

      const res = await request(app.getHttpServer())
        .patch(`/api/stores/${store.id}`)
        .send({ name: 'Updated Store' })
        .expect(200);

      expect(res.body.name).toBe('Updated Store');
    });

    it('should return 404 for non-existent store', async () => {
      await request(app.getHttpServer())
        .patch('/api/stores/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/stores/:id', () => {
    it('should delete a store', async () => {
      const store = await createStore(app);

      await request(app.getHttpServer())
        .delete(`/api/stores/${store.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/stores/${store.id}`)
        .expect(404);
    });

    it('should cascade delete products', async () => {
      const store = await createStore(app);
      const product = await createProduct(app, store.id);

      await request(app.getHttpServer())
        .delete(`/api/stores/${store.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/products/${product.id}`)
        .expect(404);
    });
  });
});
