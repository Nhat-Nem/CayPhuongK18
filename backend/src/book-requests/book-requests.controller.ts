import { Body, Controller, Post } from '@nestjs/common';
import { BookRequestsService } from './book-requests.service';
import { CreateBookRequestDTO } from './dto/create-book-request.dto';

@Controller('book-requests')
export class BookRequestsController {
    constructor (private readonly bookingrequestService: BookRequestsService) {}

    // METHOD: POST '/' -> Tạo booking request
    @Post()
    createBookRequest(@Body() dto: CreateBookRequestDTO) {
        return this.bookingrequestService.createBookRequest(dto)
    }
}
