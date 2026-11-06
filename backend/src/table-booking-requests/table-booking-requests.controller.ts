import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TableBookingRequestsService } from './table-booking-requests.service';
import { CreateTableBookingRequestDto } from './dto/create-table-booking-request.dto';
import { UpdateTableBookingStatusDto } from './dto/update-table-booking-status.dto';

@Controller('table-booking-requests')
export class TableBookingRequestsController {
    constructor(
        private readonly tableBookingRequestService: TableBookingRequestsService
    ) {}

    @Get()
    findAll() {
        return this.tableBookingRequestService.findAll()
    }

    @Post()
    create(@Body() dto: CreateTableBookingRequestDto) {
        return this.tableBookingRequestService.create(dto)
    }

    @Patch(':id')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateTableBookingStatusDto) {
        return this.tableBookingRequestService.updateStatus(id, dto)
    }
}
