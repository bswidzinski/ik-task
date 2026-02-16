import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  createStore,
  createProduct,
  clearDatabase,
} from '../test-utils';
import { ProductCategory } from '../products/product.entity';

describe('Reports API', () => {
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

  describe('GET /api/reports/low-stock', () => {
    it('should return correct report structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/low-stock')
        .expect(200);

      expect(res.body).toMatchObject({
        threshold: 5,
        totalLowStockProducts: 0,
        totalRestockCost: 0,
        stores: [],
      });
    });

    it('should identify low stock products', async () => {
      const store = await createStore(app);
      await createProduct(app, store.id, {
        name: 'Low Stock',
        quantity: 2,
        price: 10,
      });
      await createProduct(app, store.id, {
        name: 'Well Stocked',
        quantity: 100,
        price: 10,
      });

      const res = await request(app.getHttpServer())
        .get('/api/reports/low-stock')
        .expect(200);

      expect(res.body.totalLowStockProducts).toBe(1);
      expect(res.body.stores[0].products).toHaveLength(1);
      expect(res.body.stores[0].products[0].name).toBe('Low Stock');
    });

    it('should group products by store', async () => {
      const storeA = await createStore(app, { name: 'Store A' });
      const storeB = await createStore(app, { name: 'Store B' });

      await createProduct(app, storeA.id, { name: 'A1', quantity: 1 });
      await createProduct(app, storeA.id, { name: 'A2', quantity: 2 });
      await createProduct(app, storeB.id, { name: 'B1', quantity: 3 });

      const res = await request(app.getHttpServer())
        .get('/api/reports/low-stock')
        .expect(200);

      expect(res.body.totalLowStockProducts).toBe(3);
      expect(res.body.stores).toHaveLength(2);

      // Sorted by lowStockCount descending
      const first = res.body.stores[0];
      expect(first.storeName).toBe('Store A');
      expect(first.lowStockCount).toBe(2);
      expect(first.products).toHaveLength(2);

      const second = res.body.stores[1];
      expect(second.storeName).toBe('Store B');
      expect(second.lowStockCount).toBe(1);
    });

    it('should calculate restock cost correctly', async () => {
      const store = await createStore(app);
      // deficit = threshold(5) - quantity(2) = 3, cost = 3 * 10 = 30
      await createProduct(app, store.id, {
        name: 'Item',
        quantity: 2,
        price: 10,
      });

      const res = await request(app.getHttpServer())
        .get('/api/reports/low-stock')
        .expect(200);

      expect(res.body.totalRestockCost).toBe(30);
      expect(res.body.stores[0].restockCost).toBe(30);
      expect(res.body.stores[0].products[0].deficit).toBe(3);
    });

    it('should respect custom threshold', async () => {
      const store = await createStore(app);
      await createProduct(app, store.id, {
        name: 'Medium Stock',
        quantity: 8,
        price: 5,
      });

      // Default threshold (5) should not include it
      const defaultRes = await request(app.getHttpServer())
        .get('/api/reports/low-stock')
        .expect(200);
      expect(defaultRes.body.totalLowStockProducts).toBe(0);

      // Custom threshold (10) should include it
      const customRes = await request(app.getHttpServer())
        .get('/api/reports/low-stock?threshold=10')
        .expect(200);
      expect(customRes.body.threshold).toBe(10);
      expect(customRes.body.totalLowStockProducts).toBe(1);
    });

    it('should return empty result when no low stock products exist', async () => {
      const store = await createStore(app);
      await createProduct(app, store.id, {
        name: 'Plenty',
        quantity: 100,
        price: 10,
      });

      const res = await request(app.getHttpServer())
        .get('/api/reports/low-stock')
        .expect(200);

      expect(res.body.totalLowStockProducts).toBe(0);
      expect(res.body.totalRestockCost).toBe(0);
      expect(res.body.stores).toHaveLength(0);
    });
  });
});
