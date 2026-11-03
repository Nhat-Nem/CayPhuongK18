import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoomBookingRequestsService } from './room-booking-requests.service';
import { CreateRoomBookingRequestDto } from './dto/create-room-booking-request.dto';
import { UpdateRoomBookingRequestStatusDto } from './dto/update-room-booking-request-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    update(@Param('id') id: string, @Body() dto: UpdateRoomBookingRequestStatusDto) {
        return this.roomBookingService.updateStatus(id, dto.status)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.roomBookingService.remove(id)
    }
}
