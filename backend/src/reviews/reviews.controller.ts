import { Body, Controller, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
    constructor(
        private readonly reviewService: ReviewsService
    ) {}

    // Tao
    @Post()
    create(@Body() dto: CreateReviewDto) {
        return this.reviewService.create(dto)
    }
}
