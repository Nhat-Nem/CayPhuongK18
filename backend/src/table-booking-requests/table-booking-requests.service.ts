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
    findAll() {
        this.tableBookingLogger.log(`Get all table booking request at ${this.getCurrentTime()}`)

        return this.tableBookingRequestRepository.find({
            order: { createdAt: "DESC" }
        })
    }

    // Tạo Table Booking Request
    async create(dto: CreateTableBookingRequestDto) {
        const request = this.tableBookingRequestRepository.create({
            ...dto, status: TableBookingStatus.PENDING
        })

        this.tableBookingLogger.log(`Create Table Booking Request successfully at ${this.getCurrentTime()}`)

        return this.tableBookingRequestRepository.save(request)
    }

    // update trang thai
    async updateStatus(id: string, dto: UpdateTableBookingStatusDto) {
        const request = await this.tableBookingRequestRepository.findOne({
            where: { id }
        })

        if (!request) {
            throw new NotFoundException("Table Booking Request Not Found")
        }

        request.status = dto.status

        this.tableBookingLogger.log(`Update Table Booking Request ${id} status to ${dto.status} at ${this.getCurrentTime()}`)

        return this.tableBookingRequestRepository.save(request)
    }
}
