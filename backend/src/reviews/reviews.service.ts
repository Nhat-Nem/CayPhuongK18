import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewsLogger } from './reviews.logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewFeatureDto } from './dto/update-review-featured.dto';

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

    // Xoa danh gia
    async remove(id: string) {
        const review = await this.reviewRepository.findOne({
            where: { id }
        })

        if (!review) {
            throw new NotFoundException("No reviews found")
        }

        await this.reviewRepository.remove(review)

        this.reviewLogger.log(`Delete review ${id} successfullt at ${this.getCurrentTime()}`)
        
        return { message: "Xoa danh gia thanh cong" }
    }

    // Bat tat hien thi danh gia
    async updateFeatured(id: string, dto: UpdateReviewFeatureDto) {
        const review = await this.reviewRepository.findOne({
            where: { id }
        })

        if (!review) {
            throw new NotFoundException("No reviews found")
        }

        review.isFeatured = dto.isFeatured

        await this.reviewRepository.save(review)

        this.reviewLogger.log(`Update feature status of review ${id} successfully at ${this.getCurrentTime()}`)
        
        return review
    }

    // Tim danh gia
    async findFeatured() {
        return this.reviewRepository.find({
            where: { isFeatured: true },
            order: { createdAt: "DESC" }
        })
    }
}
