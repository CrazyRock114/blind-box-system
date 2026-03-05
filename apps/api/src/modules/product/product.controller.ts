/** @format */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * 获取商品列表
   * GET /api/products?page=1&limit=20&categoryId=&type=blind_box&keyword=
   */
  @Get()
  async listProducts(@Query() query: any) {
    return this.productService.listProducts({
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 20,
      categoryId: query.categoryId,
      type: query.type,
      keyword: query.keyword,
      isRecommend: query.isRecommend === 'true' ? true : undefined,
      isNew: query.isNew === 'true' ? true : undefined,
    });
  }

  /**
   * 获取推荐商品
   * GET /api/products/recommended
   */
  @Get('recommended')
  async getRecommended(@Query('limit') limit?: string) {
    return this.productService.getRecommendedProducts(parseInt(limit) || 10);
  }

  /**
   * 获取新品
   * GET /api/products/new
   */
  @Get('new')
  async getNew(@Query('limit') limit?: string) {
    return this.productService.getNewProducts(parseInt(limit) || 10);
  }

  /**
   * 获取商品详情
   * GET /api/products/:id
   */
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productService.getProduct(id);
  }

  /**
   * 创建商品（需要认证）
   * POST /api/products
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(@Body() data: any) {
    return this.productService.createProduct(data);
  }

  /**
   * 更新商品（需要认证）
   * PUT /api/products/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.productService.updateProduct(id, data);
  }

  /**
   * 删除商品（需要认证）
   * DELETE /api/products/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}

@Controller('categories')
export class CategoryController {
  constructor(private readonly productService: ProductService) {}

  /**
   * 获取所有分类
   * GET /api/categories
   */
  @Get()
  async listCategories() {
    return this.productService.listCategories();
  }

  /**
   * 获取分类详情
   * GET /api/categories/:id
   */
  @Get(':id')
  async getCategory(@Param('id') id: string) {
    return this.productService.getCategory(id);
  }

  /**
   * 创建分类（需要认证）
   * POST /api/categories
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createCategory(@Body() data: any) {
    return this.productService.createCategory(data);
  }

  /**
   * 更新分类（需要认证）
   * PUT /api/categories/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.productService.updateCategory(id, data);
  }
}
