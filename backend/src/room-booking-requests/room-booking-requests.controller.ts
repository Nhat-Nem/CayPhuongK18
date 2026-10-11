import { Body, Controller, Post } from '@nestjs/common';
import { RoomBookingRequestsService } from './room-booking-requests.service';
import { CreateRoomBookingRequestDto } from './dto/create-room-booking-request.dto';

@Controller('room-booking-requests')
export class RoomBookingRequestsController {
    constructor(
        private readonly roomBookingService: RoomBookingRequestsService
    ) {}

    @Post() 
    create(@Body() dto: CreateRoomBookingRequestDto) {
        return this.roomBookingService.create(dto)
    }
}
