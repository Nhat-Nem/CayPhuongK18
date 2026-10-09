import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookRequest } from './entities/book-request.entity';
import { Repository } from 'typeorm';
import { BookRequestLogger } from './book-request.logger';
import { CreateBookRequestDTO } from './dto/create-book-request.dto';

@Injectable()
export class BookRequestsService {
    constructor(
        private readonly bookrequestLogger: BookRequestLogger,

        @InjectRepository(BookRequest)
        private readonly bookrequestRepository: Repository<BookRequest>
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // Tạo booking request
    // Input: CreateBookRequestDTO
    async createBookRequest(dto: CreateBookRequestDTO) {
        const request = this.bookrequestRepository.create(dto)

        this.bookrequestLogger.log(`Create Booking Request successfully at ${this.getCurrentTime()}`)

        return await this.bookrequestRepository.save(request)
    }
}
