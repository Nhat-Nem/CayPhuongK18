import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryLogger } from './category.logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryLogger: CategoryLogger,

        @InjectRepository(Category)
        private readonly categoryReposiroty: Repository<Category>
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // Tim het
    findAll() {
        this.categoryLogger.log(`Get all category successfully at ${this.getCurrentTime()}`)

        return this.categoryReposiroty.find({
            order: { id: "ASC" }
        })
    }

    // Tao danh muc
    async create(dto: CreateCategoryDto) {
        const category = this.categoryReposiroty.create({
            name: dto.name,
            description: dto.description
        }) 

        this.categoryLogger.log(`Create category successfully at ${this.getCurrentTime()}`)

        return this.categoryReposiroty.save(category)
    }

    // Xoa danh muc
    async remove(id: string) {
        const category = await this.categoryReposiroty.findOneBy({ id })

        if (!category) {
            throw new NotFoundException("Category not found")
        }

        await this.categoryReposiroty.remove(category)

        this.categoryLogger.log(`Delete category successfully at ${this.getCurrentTime()}`)

        return { message: "Delete category successfully" }
    }
}
