import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoomBookingRequestsService } from './room-booking-requests.service';
import { CreateRoomBookingRequestDto } from './dto/create-room-booking-request.dto';

@Controller('room-booking-requests')
export class RoomBookingRequestsController {
    constructor(
        private readonly roomBookingService: RoomBookingRequestsService
    ) {}

    @Get()
    findAll() {
        return this.roomBookingService.findAll()
    }

    @Post() 
    create(@Body() dto: CreateRoomBookingRequestDto) {
        return this.roomBookingService.create(dto)
    }
}
