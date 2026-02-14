import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../stores/store.entity';
import { Product, ProductCategory } from '../products/product.entity';

interface ProductSeed {
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
}

interface StoreSeed {
  name: string;
  address: string;
  products: ProductSeed[];
}

const SEED_DATA: StoreSeed[] = [
  {
    name: 'Downtown Electronics Hub',
    address: '142 Main Street, New York, NY 10001',
    products: [
      // 22 products — tests pagination across 3 pages
      {
        name: 'MacBook Pro 16"',
        category: ProductCategory.ELECTRONICS,
        price: 2499.99,
        quantity: 8,
      },
      {
        name: 'iPhone 16 Pro',
        category: ProductCategory.ELECTRONICS,
        price: 1199.99,
        quantity: 0,
      },
      {
        name: 'iPad Air',
        category: ProductCategory.ELECTRONICS,
        price: 599.99,
        quantity: 3,
      },
      {
        name: 'AirPods Pro',
        category: ProductCategory.ELECTRONICS,
        price: 249.99,
        quantity: 45,
      },
      {
        name: 'Apple Watch Ultra',
        category: ProductCategory.ELECTRONICS,
        price: 799.99,
        quantity: 12,
      },
      {
        name: 'Samsung Galaxy S24',
        category: ProductCategory.ELECTRONICS,
        price: 899.99,
        quantity: 0,
      },
      {
        name: 'Sony WH-1000XM5',
        category: ProductCategory.ELECTRONICS,
        price: 349.99,
        quantity: 30,
      },
      {
        name: 'Nintendo Switch OLED',
        category: ProductCategory.ELECTRONICS,
        price: 349.99,
        quantity: 22,
      },
      {
        name: 'Kindle Paperwhite',
        category: ProductCategory.ELECTRONICS,
        price: 139.99,
        quantity: 1,
      },
      {
        name: 'Bose QuietComfort',
        category: ProductCategory.ELECTRONICS,
        price: 279.99,
        quantity: 18,
      },
      {
        name: 'USB-C Hub Adapter',
        category: ProductCategory.ELECTRONICS,
        price: 34.99,
        quantity: 150,
      },
      {
        name: 'Mechanical Keyboard',
        category: ProductCategory.ELECTRONICS,
        price: 129.99,
        quantity: 25,
      },
      {
        name: 'Gaming Mouse',
        category: ProductCategory.ELECTRONICS,
        price: 69.99,
        quantity: 40,
      },
      {
        name: '27" 4K Monitor',
        category: ProductCategory.ELECTRONICS,
        price: 449.99,
        quantity: 5,
      },
      {
        name: 'Webcam HD 1080p',
        category: ProductCategory.ELECTRONICS,
        price: 59.99,
        quantity: 60,
      },
      {
        name: 'Portable SSD 1TB',
        category: ProductCategory.ELECTRONICS,
        price: 89.99,
        quantity: 35,
      },
      {
        name: 'Wireless Charger',
        category: ProductCategory.ELECTRONICS,
        price: 29.99,
        quantity: 80,
      },
      {
        name: 'Smart Speaker',
        category: ProductCategory.ELECTRONICS,
        price: 99.99,
        quantity: 2,
      },
      {
        name: 'Bluetooth Earbuds',
        category: ProductCategory.ELECTRONICS,
        price: 49.99,
        quantity: 55,
      },
      {
        name: 'Laptop Stand',
        category: ProductCategory.HOME,
        price: 39.99,
        quantity: 42,
      },
      {
        name: 'Desk Lamp LED',
        category: ProductCategory.HOME,
        price: 24.99,
        quantity: 33,
      },
      {
        name: 'Cable Management Kit',
        category: ProductCategory.OTHER,
        price: 14.99,
        quantity: 70,
      },
    ],
  },
  {
    name: 'Riverside Fashion Outlet',
    address: '789 River Road, Chicago, IL 60601',
    products: [
      // 15 products — tests pagination with 2 pages
      {
        name: 'Slim Fit Jeans',
        category: ProductCategory.CLOTHING,
        price: 59.99,
        quantity: 40,
      },
      {
        name: 'Cotton T-Shirt Pack',
        category: ProductCategory.CLOTHING,
        price: 24.99,
        quantity: 100,
      },
      {
        name: 'Winter Parka',
        category: ProductCategory.CLOTHING,
        price: 189.99,
        quantity: 0,
      },
      {
        name: 'Running Sneakers',
        category: ProductCategory.CLOTHING,
        price: 129.99,
        quantity: 20,
      },
      {
        name: 'Wool Sweater',
        category: ProductCategory.CLOTHING,
        price: 79.99,
        quantity: 4,
      },
      {
        name: 'Leather Belt',
        category: ProductCategory.CLOTHING,
        price: 34.99,
        quantity: 55,
      },
      {
        name: 'Silk Tie',
        category: ProductCategory.CLOTHING,
        price: 44.99,
        quantity: 30,
      },
      {
        name: 'Denim Jacket',
        category: ProductCategory.CLOTHING,
        price: 89.99,
        quantity: 15,
      },
      {
        name: 'Linen Shorts',
        category: ProductCategory.CLOTHING,
        price: 39.99,
        quantity: 1,
      },
      {
        name: 'Athletic Socks 6-Pack',
        category: ProductCategory.CLOTHING,
        price: 14.99,
        quantity: 200,
      },
      {
        name: 'Baseball Cap',
        category: ProductCategory.CLOTHING,
        price: 19.99,
        quantity: 75,
      },
      {
        name: 'Sunglasses',
        category: ProductCategory.OTHER,
        price: 149.99,
        quantity: 2,
      },
      {
        name: 'Leather Wallet',
        category: ProductCategory.OTHER,
        price: 49.99,
        quantity: 35,
      },
      {
        name: 'Canvas Backpack',
        category: ProductCategory.OTHER,
        price: 64.99,
        quantity: 22,
      },
      {
        name: 'Yoga Mat',
        category: ProductCategory.SPORTS,
        price: 29.99,
        quantity: 0,
      },
    ],
  },
  {
    name: 'Green Valley Grocers',
    address: '456 Oak Avenue, Portland, OR 97201',
    products: [
      // 8 products
      {
        name: 'Organic Olive Oil',
        category: ProductCategory.FOOD,
        price: 12.99,
        quantity: 60,
      },
      {
        name: 'Artisan Bread Loaf',
        category: ProductCategory.FOOD,
        price: 5.49,
        quantity: 0,
      },
      {
        name: 'Dark Chocolate Bar',
        category: ProductCategory.FOOD,
        price: 3.99,
        quantity: 120,
      },
      {
        name: 'Ground Coffee 1lb',
        category: ProductCategory.FOOD,
        price: 14.99,
        quantity: 45,
      },
      {
        name: 'Almond Butter',
        category: ProductCategory.FOOD,
        price: 8.99,
        quantity: 3,
      },
      {
        name: 'Dried Pasta Pack',
        category: ProductCategory.FOOD,
        price: 2.49,
        quantity: 200,
      },
      {
        name: 'Granola Cereal',
        category: ProductCategory.FOOD,
        price: 6.99,
        quantity: 38,
      },
      {
        name: 'Sparkling Water 12-Pack',
        category: ProductCategory.FOOD,
        price: 7.99,
        quantity: 4,
      },
    ],
  },
  {
    name: 'Summit Sports & Outdoors',
    address: '321 Mountain Drive, Denver, CO 80201',
    products: [
      // 7 products
      {
        name: 'Mountain Bike',
        category: ProductCategory.SPORTS,
        price: 899.99,
        quantity: 3,
      },
      {
        name: 'Tennis Racket',
        category: ProductCategory.SPORTS,
        price: 149.99,
        quantity: 20,
      },
      {
        name: 'Basketball',
        category: ProductCategory.SPORTS,
        price: 29.99,
        quantity: 50,
      },
      {
        name: 'Hiking Boots',
        category: ProductCategory.SPORTS,
        price: 179.99,
        quantity: 0,
      },
      {
        name: 'Camping Tent 4-Person',
        category: ProductCategory.SPORTS,
        price: 249.99,
        quantity: 7,
      },
      {
        name: 'Fishing Rod Combo',
        category: ProductCategory.SPORTS,
        price: 89.99,
        quantity: 15,
      },
      {
        name: 'Dumbbell Set 50lb',
        category: ProductCategory.SPORTS,
        price: 119.99,
        quantity: 1,
      },
    ],
  },
  {
    name: 'Cozy Home Essentials',
    address: '567 Elm Street, Austin, TX 73301',
    products: [
      // 6 products
      {
        name: 'Memory Foam Pillow',
        category: ProductCategory.HOME,
        price: 49.99,
        quantity: 30,
      },
      {
        name: 'Scented Candle Set',
        category: ProductCategory.HOME,
        price: 24.99,
        quantity: 80,
      },
      {
        name: 'Throw Blanket',
        category: ProductCategory.HOME,
        price: 39.99,
        quantity: 2,
      },
      {
        name: 'Ceramic Vase',
        category: ProductCategory.HOME,
        price: 29.99,
        quantity: 25,
      },
      {
        name: 'Wall Clock Modern',
        category: ProductCategory.HOME,
        price: 34.99,
        quantity: 0,
      },
      {
        name: 'Kitchen Knife Set',
        category: ProductCategory.HOME,
        price: 79.99,
        quantity: 14,
      },
    ],
  },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    
    const count = await this.storesRepository.count();

    if (count > 0) {
      this.logger.log('Database already has data — skipping seed');
      return;
    }

    this.logger.log('Seeding database...');

    for (const storeSeed of SEED_DATA) {
      const store = await this.storesRepository.save(
        this.storesRepository.create({
          name: storeSeed.name,
          address: storeSeed.address,
        }),
      );

      const products = storeSeed.products.map((p) =>
        this.productsRepository.create({ ...p, storeId: store.id }),
      );
      await this.productsRepository.save(products);
    }

    const totalProducts = SEED_DATA.reduce(
      (sum, s) => sum + s.products.length,
      0,
    );
    this.logger.log(
      `Seeded ${SEED_DATA.length} stores and ${totalProducts} products`,
    );
  }
}
