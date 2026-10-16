import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('category')
export class CategoryController {
    constructor(
        private readonly categoryServcie: CategoryService
    ) {}

    @Get()
    findAll() {
        return this.categoryServcie.findAll()
    }

    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return this.categoryServcie.create(dto)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoryServcie.remove(id)
    }
}
