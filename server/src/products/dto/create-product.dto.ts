import {
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ProductCategory } from '../product.entity';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(ProductCategory)
  category!: ProductCategory;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price!: number;

  @IsInt()
  @Min(0)
  quantity!: number;
}
