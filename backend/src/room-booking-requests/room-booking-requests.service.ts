import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomBookingRequest } from './entities/room-booking-request.entity';
import { Repository } from 'typeorm';
import { CreateRoomBookingRequestDto } from './dto/create-room-booking-request.dto';
import { RoomBookingLogger } from './room-booking-requests.logger';
import { RoomBookingRequestStatus } from './dto/update-room-booking-request-status.dto';

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

    // Cap nhat trang thai
    async updateStatus(id: string, status: RoomBookingRequestStatus) {
        const request = await this.roomBookingRequestRepository.findOneBy({ id })
        
        if (!request) {
            throw new NotFoundException("This Booking Request Not Found")
        }

        if (
            request.status === RoomBookingRequestStatus.COMPLETED || 
            request.status === RoomBookingRequestStatus.CANCELLED
        ) {
            throw new BadRequestException(`Cannot update booking request because its status is ${request.status} (LOCKED)`)
        }

        request.status = status

        const result = await this.roomBookingRequestRepository.save(request)

        this.roomBookingLogger.log(`Update room booking request ${id} successfully at ${this.getCurrentTime()}`)
    
        return result
    }

    // Xoa yeu cau
    async remove(id: string) {
        const request = await this.roomBookingRequestRepository.findOneBy({ id })

        if (!request) {
            throw new NotFoundException("This Request Booking Not Found")
        }

        await this.roomBookingRequestRepository.remove(request)

        this.roomBookingLogger.log(`Delete room booking request ${id} successfully at ${this.getCurrentTime()}`)

        return { message: "Delete booking request successfully" }
    }
}
