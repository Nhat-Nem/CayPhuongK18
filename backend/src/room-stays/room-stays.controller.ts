import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RoomStaysService } from './room-stays.service';
import { CreateRoomStayDto } from './dto/create-room-stay.dto';
import { CheckoutRoomStayDto } from './dto/checkout-room-stay.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('room-stays')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
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
