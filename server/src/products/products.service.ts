import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  Equal,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Store } from '../stores/store.entity';

export interface PaginatedProducts {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
  ) {}

  async findAll(
    query: QueryProductsDto,
    storeId?: string,
  ): Promise<PaginatedProducts> {
    const {
      category,
      search,
      inStock,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;
    const effectiveStoreId = storeId ?? query.storeId;

    const where: FindOptionsWhere<Product> = {};

    if (effectiveStoreId) where.storeId = effectiveStoreId;
    if (category) where.category = category;
    if (search) where.name = ILike(`%${search}%`);
    if (inStock != null) where.quantity = inStock ? MoreThan(0) : Equal(0);
    if (minPrice != null || maxPrice != null) {
      where.price = And(
        ...(minPrice != null ? [MoreThanOrEqual(minPrice)] : []),
        ...(maxPrice != null ? [LessThanOrEqual(maxPrice)] : []),
      );
    }

    const [data, total] = await this.productsRepository.findAndCount({
      where,
      relations: ['store'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { store: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  async create(storeId: string, dto: CreateProductDto): Promise<Product> {
    const store = await this.storesRepository.findOneBy({ id: storeId });
    if (!store) {
      throw new NotFoundException(`Store with id "${storeId}" not found`);
    }
    const product = this.productsRepository.create({ ...dto, storeId });
    const saved = await this.productsRepository.save(product);
    saved.store = store;
    return saved;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
