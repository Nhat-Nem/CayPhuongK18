import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TableBookingRequest, TableBookingStatus } from './entities/table-booking-request.entity';
import { Repository } from 'typeorm';
import { CreateTableBookingRequestDto } from './dto/create-table-booking-request.dto';
import { TableBookingLogger } from './table-booking-requests.logger';
import { UpdateTableBookingStatusDto } from './dto/update-table-booking-status.dto';

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
    async findAll() {
        return this.tableBookingRequestRepository.find({
            order: { createdAt: "DESC" }
        })
    }

    // Tạo Table Booking Request
    async create(dto: CreateTableBookingRequestDto) {
        const request = this.tableBookingRequestRepository.create({
            ...dto, status: TableBookingStatus.PENDING
        })

        const result = await this.tableBookingRequestRepository.save(request)

        this.tableBookingLogger.log(`Create Table Booking Request ID ${result.id} successfully at ${this.getCurrentTime()}`)

        return result
    }

    // update trang thai
    async updateStatus(id: string, dto: UpdateTableBookingStatusDto) {
        const request = await this.tableBookingRequestRepository.findOne({
            where: { id }
        })

        if (!request) {
            throw new NotFoundException("Table Booking Request Not Found")
        }

        const oldStatus = request.status

        request.status = dto.status

        const result = await this.tableBookingRequestRepository.save(request)

        this.tableBookingLogger.log(`Update Table Booking Request ID ${id} status from ${oldStatus} to ${dto.status} at ${this.getCurrentTime()}`)

        return result
    }
}
