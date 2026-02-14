import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Product } from '../products/product.entity';

export interface LowStockReport {
  threshold: number;
  totalLowStockProducts: number;
  totalRestockCost: number;
  stores: {
    storeId: string;
    storeName: string;
    lowStockCount: number;
    products: (Pick<
      Product,
      'id' | 'name' | 'category' | 'price' | 'quantity'
    > & {
      deficit: number;
    })[];
  }[];
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async getLowStockReport(threshold: number = 5): Promise<LowStockReport> {
    const products = await this.productsRepository.find({
      where: { quantity: LessThanOrEqual(threshold) },
      relations: ['store'],
      order: { quantity: 'ASC' },
    });

    const storeMap = new Map<string, LowStockReport['stores'][number]>();

    for (const product of products) {
      if (!storeMap.has(product.storeId)) {
        storeMap.set(product.storeId, {
          storeId: product.storeId,
          storeName: product.store.name,
          lowStockCount: 0,
          products: [],
        });
      }

      const store = storeMap.get(product.storeId)!;
      store.lowStockCount++;
      store.products.push({
        ...product,
        deficit: threshold - product.quantity,
      });
    }

    const stores = [...storeMap.values()].sort(
      (a, b) => b.lowStockCount - a.lowStockCount,
    );

    const totalRestockCost = products.reduce(
      (sum, p) => sum + Number(p.price) * (threshold - p.quantity),
      0,
    );

    return {
      threshold,
      totalLowStockProducts: products.length,
      totalRestockCost: Math.round(totalRestockCost * 100) / 100,
      stores,
    };
  }
}
