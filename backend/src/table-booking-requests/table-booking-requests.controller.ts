import { Body, Controller, Get, Post } from '@nestjs/common';
import { TableBookingRequestsService } from './table-booking-requests.service';
import { CreateTableBookingRequestDto } from './dto/create-table-booking-request.dto';

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
}
