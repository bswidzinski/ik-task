import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Store } from './stores/store.entity';
import { Product, ProductCategory } from './products/product.entity';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { ReportsModule } from './reports/reports.module';
import request from 'supertest';

export async function createTestApp(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        synchronize: true,
        entities: [Store, Product],
      }),
      StoresModule,
      ProductsModule,
      ReportsModule,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

export async function clearDatabase(app: INestApplication): Promise<void> {
  const ds = app.get(DataSource);
  await ds.query('DELETE FROM products');
  await ds.query('DELETE FROM stores');
}

export async function createStore(
  app: INestApplication,
  data: { name?: string; address?: string } = {},
) {
  const res = await request(app.getHttpServer())
    .post('/api/stores')
    .send({
      name: data.name ?? 'Test Store',
      address: data.address ?? '123 Test St',
    })
    .expect(201);
  return res.body;
}

export async function createProduct(
  app: INestApplication,
  storeId: string,
  data: Partial<{
    name: string;
    category: ProductCategory;
    price: number;
    quantity: number;
  }> = {},
) {
  const res = await request(app.getHttpServer())
    .post(`/api/stores/${storeId}/products`)
    .send({
      name: data.name ?? 'Test Product',
      category: data.category ?? ProductCategory.ELECTRONICS,
      price: data.price ?? 9.99,
      quantity: data.quantity ?? 10,
    })
    .expect(201);
  return res.body;
}
