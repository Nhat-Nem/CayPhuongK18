import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TableBookingRequest } from './entities/table-booking-request.entity';
import { Repository } from 'typeorm';
import { CreateTableBookingRequestDto } from './dto/create-table-booking-request.dto';
import { TableBookingLogger } from './table-booking-requests.logger';

@Injectable()
export class TableBookingRequestsService {
    constructor(
        private readonly tableBookingLogger: TableBookingLogger,

        @InjectRepository(TableBookingRequest)
        private readonly tableBookingRequestRepository: Repository<TableBookingRequest>
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // Lấy all booking
    findAll() {
        this.tableBookingLogger.log(`Get all table booking request at ${this.getCurrentTime()}`)

        return this.tableBookingRequestRepository.find({
            order: { createdAt: "DESC" }
        })
    }

    // Tạo Table Booking Request
    async create(dto: CreateTableBookingRequestDto) {
        const request = this.tableBookingRequestRepository.create({
            ...dto, status: "PENDING"
        })

        this.tableBookingLogger.log(`Create Table Booking Request successfully at ${this.getCurrentTime()}`)

        return this.tableBookingRequestRepository.save(request)
    }
}
