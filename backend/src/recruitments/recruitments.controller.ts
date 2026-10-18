import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RecruitmentsService } from './recruitments.service';
import { UpdateRecruitmentDto } from './dto/update-recruitment.dto';
import { CreateRecruitmentDto } from './dto/create-recruitment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('recruitments')
export class RecruitmentsController {
    constructor(
        private readonly recruimentService: RecruitmentsService
    ) {}

    @Get()
    findAll() {
        return this.recruimentService.findAll()
    }

    @Get(":id")
    findOne(@Param('id') id: string) {
        return this.recruimentService.findOne(id)
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    create(@Body() dto: CreateRecruitmentDto) {
        return this.recruimentService.create(dto)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    update(@Param('id') id: string, @Body() dto: UpdateRecruitmentDto) {
        return this.recruimentService.update(id, dto)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    remove(@Param('id') id: string) {
        return this.recruimentService.remove(id)
    }
}
