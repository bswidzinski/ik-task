import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  createStore,
  createProduct,
  clearDatabase,
} from '../test-utils';
import { ProductCategory } from './product.entity';

describe('Products API', () => {
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

  describe('GET /api/products', () => {
    it('should return paginated results', async () => {
      const store = await createStore(app);
      await createProduct(app, store.id, { name: 'Product 1' });
      await createProduct(app, store.id, { name: 'Product 2' });

      const res = await request(app.getHttpServer())
        .get('/api/products')
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta).toMatchObject({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by category', async () => {
      const store = await createStore(app);
      await createProduct(app, store.id, {
        name: 'Phone',
        category: ProductCategory.ELECTRONICS,
      });
      await createProduct(app, store.id, {
        name: 'Shirt',
        category: ProductCategory.CLOTHING,
      });

      const res = await request(app.getHttpServer())
        .get('/api/products?category=electronics')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Phone');
    });

    it('should filter by price range', async () => {
      const store = await createStore(app);
      await createProduct(app, store.id, { name: 'Cheap', price: 5.0 });
      await createProduct(app, store.id, { name: 'Mid', price: 50.0 });
      await createProduct(app, store.id, { name: 'Expensive', price: 500.0 });

      const res = await request(app.getHttpServer())
        .get('/api/products?minPrice=10&maxPrice=100')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Mid');
    });

    it('should filter by inStock', async () => {
      const store = await createStore(app);
      await createProduct(app, store.id, {
        name: 'In Stock',
        quantity: 10,
      });
      await createProduct(app, store.id, {
        name: 'Out of Stock',
        quantity: 0,
      });

      const inStock = await request(app.getHttpServer())
        .get('/api/products?inStock=true')
        .expect(200);

      expect(inStock.body.data).toHaveLength(1);
      expect(inStock.body.data[0].name).toBe('In Stock');

      const outOfStock = await request(app.getHttpServer())
        .get('/api/products?inStock=false')
        .expect(200);

      expect(outOfStock.body.data).toHaveLength(1);
      expect(outOfStock.body.data[0].name).toBe('Out of Stock');
    });

    it('should paginate correctly', async () => {
      const store = await createStore(app);
      for (let i = 1; i <= 15; i++) {
        await createProduct(app, store.id, { name: `Product ${i}` });
      }

      const page1 = await request(app.getHttpServer())
        .get('/api/products?page=1&limit=10')
        .expect(200);

      expect(page1.body.data).toHaveLength(10);
      expect(page1.body.meta).toMatchObject({
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      });

      const page2 = await request(app.getHttpServer())
        .get('/api/products?page=2&limit=10')
        .expect(200);

      expect(page2.body.data).toHaveLength(5);
      expect(page2.body.meta.page).toBe(2);
    });
  });

  describe('GET /api/stores/:storeId/products', () => {
    it('should return products for a specific store', async () => {
      const storeA = await createStore(app, { name: 'Store A' });
      const storeB = await createStore(app, { name: 'Store B' });
      await createProduct(app, storeA.id, { name: 'Product A' });
      await createProduct(app, storeB.id, { name: 'Product B' });

      const res = await request(app.getHttpServer())
        .get(`/api/stores/${storeA.id}/products`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Product A');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by id with store relation', async () => {
      const store = await createStore(app, { name: 'My Store' });
      const product = await createProduct(app, store.id, { name: 'Widget' });

      const res = await request(app.getHttpServer())
        .get(`/api/products/${product.id}`)
        .expect(200);

      expect(res.body.name).toBe('Widget');
      expect(res.body.store).toBeDefined();
      expect(res.body.store.name).toBe('My Store');
    });

    it('should return 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/api/products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /api/stores/:storeId/products', () => {
    it('should create a product with valid data', async () => {
      const store = await createStore(app);

      const res = await request(app.getHttpServer())
        .post(`/api/stores/${store.id}/products`)
        .send({
          name: 'New Product',
          category: 'electronics',
          price: 29.99,
          quantity: 5,
        })
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'New Product',
        category: 'electronics',
        price: 29.99,
        quantity: 5,
      });
      expect(res.body.id).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const store = await createStore(app);

      await request(app.getHttpServer())
        .post(`/api/stores/${store.id}/products`)
        .send({ name: 'X' })
        .expect(400);
    });

    it('should return 404 for non-existent store', async () => {
      await request(app.getHttpServer())
        .post('/api/stores/00000000-0000-0000-0000-000000000000/products')
        .send({
          name: 'Product',
          category: 'electronics',
          price: 10,
          quantity: 1,
        })
        .expect(404);
    });
  });

  describe('PATCH /api/products/:id', () => {
    it('should update a product', async () => {
      const store = await createStore(app);
      const product = await createProduct(app, store.id, { name: 'Old Name' });

      const res = await request(app.getHttpServer())
        .patch(`/api/products/${product.id}`)
        .send({ name: 'New Name', price: 19.99 })
        .expect(200);

      expect(res.body.name).toBe('New Name');
      expect(res.body.price).toBe(19.99);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const store = await createStore(app);
      const product = await createProduct(app, store.id);

      await request(app.getHttpServer())
        .delete(`/api/products/${product.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/products/${product.id}`)
        .expect(404);
    });
  });
});
