import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Store } from '../stores/store.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: { store: true },
      order: { createdAt: 'DESC' },
    });
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

  findByStore(storeId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { storeId },
      relations: { store: true },
      order: { createdAt: 'DESC' },
    });
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
