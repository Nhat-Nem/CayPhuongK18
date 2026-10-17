import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RoomBookingRequestsService } from './room-booking-requests.service';
import { CreateRoomBookingRequestDto } from './dto/create-room-booking-request.dto';
import { UpdateRoomBookingRequestStatusDto } from './dto/update-room-booking-request-status.dto';

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

    @Patch(":id")
    update(@Param('id') id: string, @Body() dto: UpdateRoomBookingRequestStatusDto) {
        return this.roomBookingService.updateStatus(id, dto.status)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.roomBookingService.remove(id)
    }
}
