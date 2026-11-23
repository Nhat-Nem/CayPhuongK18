import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { Category } from '../category/entities/category.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemsLogger } from './menu-items.logger';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly menuItemLogger: MenuItemsLogger,

    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // Lấy thời gian hiện tại
  private getCurrentTime() {
    return new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh"
    })
  }

  // Tim het
  async findAll() {
    return this.menuItemRepository.find({
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Tim theo id
  // Input: truyen vao id
  async findOne(id: string) {
    const item = await this.menuItemRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy món ăn');
    }

    this.menuItemLogger.log(`Get menu items by id ${id} successfully at ${this.getCurrentTime()}`)

    return item;
  }

  // Tao 
  async create(dto: CreateMenuItemDto) {
    const category = await this.categoryRepository.findOneBy({
      id: String(dto.categoryId),
    });

    if (!category) {
      throw new BadRequestException('Category Not Found');
    }

    const item = this.menuItemRepository.create({
      name: dto.name,
      description: dto.description,
      price: String(dto.price),
      ingredient: dto.ingredient,
      image: dto.image,
      categoryId: category.id,
    });

    const result = await this.menuItemRepository.save(item)

    this.menuItemLogger.log(`Create menu items ID ${result.id} successfully at ${this.getCurrentTime()}`)

    return result
  }

  // Sua
  async update(id: string, dto: UpdateMenuItemDto) {
    const item = await this.findOne(id);

    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepository.findOneBy({
        id: String(dto.categoryId),
      });

      if (!category) {
        throw new BadRequestException('Category Not Found');
      }

      item.category = category
      item.categoryId = category.id
    }

    if (dto.name !== undefined) item.name = dto.name;
    if (dto.description !== undefined) item.description = dto.description;
    if (dto.price !== undefined) item.price = String(dto.price);
    if (dto.ingredient !== undefined) item.ingredient = dto.ingredient;
    if (dto.image !== undefined) item.image = dto.image;

    const result = await this.menuItemRepository.save(item)

    this.menuItemLogger.log(`Update menu item ID ${id} successfully at ${this.getCurrentTime()}`)

    return result
  }

  // Xoa
  async remove(id: string) {
    const item = await this.findOne(id);

    try {
      await this.menuItemRepository.remove(item);

      this.menuItemLogger.log(`Delete menu item ID ${id} successfully at ${this.getCurrentTime()}`)

      return { message: 'Delete menu item successfully' };
    } catch {
      throw new BadRequestException('Cannot delete a dish that is currently being used in an order or promotion.',);
    }
  }
}