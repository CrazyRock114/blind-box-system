/** @format */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Product, ProductStatus } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';

interface ListProductsQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  type?: string;
  status?: string;
  keyword?: string;
  isRecommend?: boolean;
  isNew?: boolean;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>,
  ) {}

  /**
   * 获取商品列表（分页）
   */
  async listProducts(query: ListProductsQuery) {
    const {
      page = 1,
      limit = 20,
      categoryId,
      type,
      status = ProductStatus.ACTIVE,
      keyword,
      isRecommend,
      isNew,
    } = query;

    const where: any = { status };
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (isRecommend !== undefined) where.isRecommend = isRecommend;
    if (isNew !== undefined) where.isNew = isNew;
    if (keyword) where.name = Like(`%${keyword}%`);

    const options: FindManyOptions<Product> = {
      where,
      relations: ['category', 'images'],
      order: { sort: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [items, total] = await this.productRepository.findAndCount(options);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取商品详情
   */
  async getProduct(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'skus'],
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return product;
  }

  /**
   * 获取推荐商品
   */
  async getRecommendedProducts(limit = 10) {
    return this.productRepository.find({
      where: { status: ProductStatus.ACTIVE, isRecommend: true },
      relations: ['images'],
      order: { sort: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取新品
   */
  async getNewProducts(limit = 10) {
    return this.productRepository.find({
      where: { status: ProductStatus.ACTIVE, isNew: true },
      relations: ['images'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // ==================== 分类管理 ====================

  /**
   * 获取所有分类
   */
  async listCategories() {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { sort: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * 获取分类详情
   */
  async getCategory(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }

  // ==================== 管理员 API ====================

  /**
   * 创建商品
   */
  async createProduct(data: Partial<Product>) {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  /**
   * 更新商品
   */
  async updateProduct(id: string, data: Partial<Product>) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    await this.productRepository.update(id, data);
    return this.getProduct(id);
  }

  /**
   * 删除商品（软删除）
   */
  async deleteProduct(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    await this.productRepository.softDelete(id);
    return { success: true };
  }

  /**
   * 创建分类
   */
  async createCategory(data: Partial<ProductCategory>) {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  /**
   * 更新分类
   */
  async updateCategory(id: string, data: Partial<ProductCategory>) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    await this.categoryRepository.update(id, data);
    return this.getCategory(id);
  }
}
