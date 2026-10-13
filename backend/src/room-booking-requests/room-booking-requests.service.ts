import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomBookingRequest } from './entities/room-booking-request.entity';
import { Repository } from 'typeorm';
import { CreateRoomBookingRequestDto } from './dto/create-room-booking-request.dto';
import { RoomBookingLogger } from './room-booking-requests.logger';

@Injectable()
export class RoomBookingRequestsService {
    constructor(
        private readonly roomBookingLogger: RoomBookingLogger,

        @InjectRepository(RoomBookingRequest)
        private readonly roomBookingRequestRepository: Repository<RoomBookingRequest>
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // Lay het
    async findAll() {
        this.roomBookingLogger.log(`Get all room booking request successfully at ${this.getCurrentTime()}`)

        return this.roomBookingRequestRepository.find({
            order: { createdAt: "DESC" }
        })
    }

    // Tao 
    async create(dto: CreateRoomBookingRequestDto) {
        const request = this.roomBookingRequestRepository.create({
            ...dto,
            status: "PENDING"
        })

        this.roomBookingLogger.log(`Create Room Booking Request successfully at ${this.getCurrentTime()}`)
        
        return this.roomBookingRequestRepository.save(request)
    }
}
