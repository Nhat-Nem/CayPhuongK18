import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Controller('menu-items')
export class MenuItemsController {
    constructor(
        private readonly menuItemsService: MenuItemsService
    ) {}

    @Get()
    findAll() {
        return this.menuItemsService.findAll()
    }

    @Get(':id')
    findOne(@Param("id") id: string) {
        return this.menuItemsService.findOne(id)
    }

    @Post()
    create(@Body() dto: CreateMenuItemDto) {
        return this.menuItemsService.create(dto)
    }

    @Patch(":id")
    update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
        return this.menuItemsService.update(id, dto)
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.menuItemsService.remove(id)
    }
}
