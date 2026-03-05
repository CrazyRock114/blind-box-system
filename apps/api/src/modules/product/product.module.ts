/** @format */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController, CategoryController } from './product.controller';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';
import { ProductSku } from '../../entities/product-sku.entity';
import { ProductImage } from '../../entities/product-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductCategory, ProductSku, ProductImage]),
  ],
  controllers: [ProductController, CategoryController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
