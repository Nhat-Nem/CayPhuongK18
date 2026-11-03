import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() dto: CreateMenuItemDto) {
        return this.menuItemsService.create(dto)
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
        return this.menuItemsService.update(id, dto)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    delete(@Param('id') id: string) {
        return this.menuItemsService.remove(id)
    }
}
