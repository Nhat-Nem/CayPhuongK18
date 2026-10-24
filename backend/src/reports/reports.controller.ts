import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService
    ) {}

    private isValidDate(value: string):boolean {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false
        }

        const date = new Date(`${value}T00:00:00.000Z`)

        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    }

    @Get("food-revenue")
    @Roles("ADMIN")
    getFoodRevenue(
        @Query('from') from?: string,
        @Query("to") to?: string
    ) {
        if (
            (from && !this.isValidDate(from)) ||
            (to && !this.isValidDate(to))
        ) {
            throw new BadRequestException("Dates must use YYYY-MM-DD format")
        }

        if (from && to && from > to) {
            throw new BadRequestException(
                'The from date must not be later than the to date',
            );
        }

        return this.reportsService.getFoodRevenue(from, to)
    }
}
