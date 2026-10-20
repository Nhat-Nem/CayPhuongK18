import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PromotionsLogger } from './promotions.logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { Repository } from 'typeorm';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
    constructor(
        private readonly promotionsLogger: PromotionsLogger,

        @InjectRepository(Promotion)
        private readonly promotionRepository: Repository<Promotion>
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // Validate date
    private validateDates(startDate: string | Date, endDate: string | Date) {
        if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
            throw new BadRequestException("End date must be after start date")
        }
    }

    // Tim tat ca
    async findAll() {
        this.promotionsLogger.log(`Get all promotions successfully at ${this.getCurrentTime()}`)

        return this.promotionRepository.find({
            order: { id: "DESC" }
        })
    }

    // Tim theo id
    async findOne(id: string) {
        const promotion = await this.promotionRepository.findOneBy({ id })

        if (!promotion) {
            throw new NotFoundException("Cannot Found This Promotion")
        }

        this.promotionsLogger.log(`Get promotion ${id} successfully at ${this.getCurrentTime()}`)

        return promotion
    }

    // Tao
    async create(dto: CreatePromotionDto) {
        this.validateDates(dto.startDate, dto.endDate) 

        const promotion = this.promotionRepository.create(dto)

        this.promotionsLogger.log(`Create promotion successfully at ${this.getCurrentTime()}`)

        return this.promotionRepository.save(promotion)
    }

    // Update
    async update(id: string, dto: UpdatePromotionDto) {
        const promotion = await this.findOne(id)

        if (!promotion) {
            throw new NotFoundException("This Promotion Not Found")
        }

        const startDate = dto.startDate ?? promotion?.startDate
        const endDate = dto.endDate ?? promotion?.endDate

        if (startDate && endDate) {
            this.validateDates(startDate, endDate)
        }

        Object.assign(promotion, dto)

        this.promotionsLogger.log(`Update promotuon ${id} successfully at ${this.getCurrentTime()}`)

        return this.promotionRepository.save(promotion)
    }

    // Delete
    async remove(id: string) {
        const promotion = await this.findOne(id)

        if (!promotion) {
            throw new NotFoundException("This Promotion Not Found")
        }

        await this.promotionRepository.remove(promotion)

        return { message: "Delete promotion successfully" }
    }
}
