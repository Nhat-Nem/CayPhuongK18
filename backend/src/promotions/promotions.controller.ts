import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

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

    // Lay theo id
    @Get(":id")
    findOne(@Param('id') id: string) {
        return this.promotionService.findOne(id)
    }

    // Tao
    @Post()
    create(@Body() dto: CreatePromotionDto) {
        return this.promotionService.create(dto)
    }

    // Update
    @Patch(":id")
    update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
        return this.promotionService.update(id, dto)
    }

    // Xoa
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.promotionService.remove(id)
    }
}
