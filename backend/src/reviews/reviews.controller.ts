import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateReviewFeatureDto } from './dto/update-review-featured.dto';

@Controller('reviews')
export class ReviewsController {
    constructor(
        private readonly reviewService: ReviewsService
    ) {}

    @Get() 
    findAll() {
        return this.reviewService.findAll()
    }

    // Tao
    @Post()
    create(@Body() dto: CreateReviewDto) {
        return this.reviewService.create(dto)
    }

    // Xoa review
    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    remove(@Param('id') id: string) {
        return this.reviewService.remove(id)
    }

    // Bat tat hien thi
    @Patch(":id/featured")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateFeatured(@Param("id") id: string, @Body() dto: UpdateReviewFeatureDto) {
        return this.reviewService.updateFeatured(id, dto)
    }

    // tim hien thi
    @Get("featured")
    findFeatured() {
        return this.reviewService.findFeatured()
    }
}
