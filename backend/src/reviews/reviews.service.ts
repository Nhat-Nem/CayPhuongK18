import { Injectable } from '@nestjs/common';
import { ReviewsLogger } from './reviews.logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        private readonly reviewLogger: ReviewsLogger,

        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // Lay het
    async findAll() {
        this.reviewLogger.log(`Get all reviews successfully at ${this.getCurrentTime()}`)

        return this.reviewRepository.find({
            order: { createdAt: "DESC" }
        })
    }

    // Tao review
    async create(dto: CreateReviewDto) {
        const review = this.reviewRepository.create(dto)

        this.reviewLogger.log(`Create review successfully at ${this.getCurrentTime()}`)

        return this.reviewRepository.save(review)
    }
}
