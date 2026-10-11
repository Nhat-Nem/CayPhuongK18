import { Body, Controller, Post } from '@nestjs/common';
import { TableBookingRequestsService } from './table-booking-requests.service';
import { CreateTableBookingRequestDto } from './dto/create-table-booking-request.dto';

@Controller('table-booking-requests')
export class TableBookingRequestsController {
    constructor(
        private readonly tableBookingRequestService: TableBookingRequestsService
    ) {}

    @Post()
    create(@Body() dto: CreateTableBookingRequestDto) {
        return this.tableBookingRequestService.create(dto)
    }
}
