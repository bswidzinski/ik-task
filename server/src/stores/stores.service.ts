import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
  ) {}

  findAll(): Promise<Store[]> {
    return this.storesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storesRepository.findOneBy({ id });
    if (!store) {
      throw new NotFoundException(`Store with id "${id}" not found`);
    }
    return store;
  }

  create(dto: CreateStoreDto): Promise<Store> {
    const store = this.storesRepository.create(dto);
    return this.storesRepository.save(store);
  }

  async update(id: string, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);
    Object.assign(store, dto);
    return this.storesRepository.save(store);
  }

  async remove(id: string): Promise<void> {
    const store = await this.findOne(id);
    await this.storesRepository.remove(store);
  }
}
