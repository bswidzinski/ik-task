import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get('products/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Get('stores/:storeId/products')
  findByStore(
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ): Promise<Product[]> {
    return this.productsService.findByStore(storeId);
  }

  @Post('stores/:storeId/products')
  create(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Body() dto: CreateProductDto,
  ): Promise<Product> {
    return this.productsService.create(storeId, dto);
  }

  @Patch('products/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
