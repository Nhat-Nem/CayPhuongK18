import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { WalkInVisitsService } from './walk-in-visits.service';
import { CreateWalkInVisitDto } from './dto/create-walk-in-visit.dto';

@Controller('walk-in-visits')
export class WalkInVisitsController {
    constructor(
        private readonly walkInService: WalkInVisitsService
    ) {}

    @Get()
    findAll() {
        return this.walkInService.findAll()
    }

    @Post()
    create(@Body() dto: CreateWalkInVisitDto) {
        return this.walkInService.create(dto)
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, 
            @Body() body: { status?: string }) {
        return this.walkInService.update(String(id), body)
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.walkInService.remove(String(id))
    }
}
