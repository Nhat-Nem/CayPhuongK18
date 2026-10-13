import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

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
}
