import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoomStaysService } from './room-stays.service';
import { CreateRoomStayDto } from './dto/create-room-stay.dto';
import { CheckoutRoomStayDto } from './dto/checkout-room-stay.dto';

@Controller('room-stays')
export class RoomStaysController {
    constructor(
        private readonly roomStayService: RoomStaysService
    ) {}

    @Get()
    findAll() {
        return this.roomStayService.findAll()
    }

    @Post()
    checkIn(@Body() dto: CreateRoomStayDto) {
        return this.roomStayService.checkIn(dto)
    }

    @Post(':id/checkout') 
    checkout(
        @Param('id') id: string,
        @Body() dto: CheckoutRoomStayDto
    ) {
        return this.roomStayService.checkOut(id, dto)
    }
}
