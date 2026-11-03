import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('promotions')
export class PromotionsController {
    constructor(
        private readonly promotionService: PromotionsService
    ) {}

    // Lay tat ca
    @Get()
    findAll() {
        return this.promotionService.findAll()
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findAllForAdmin() {
        return this.promotionService.findAll()
    }

    // Lay theo id
    @Get(":id")
    findOne(@Param('id') id: string) {
        return this.promotionService.findOne(id)
    }

    // Tao
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() dto: CreatePromotionDto) {
        return this.promotionService.create(dto)
    }

    // Update
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
        return this.promotionService.update(id, dto)
    }

    // Xoa
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.promotionService.remove(id)
    }
}
