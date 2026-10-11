import { Module } from '@nestjs/common';
import { TableBookingRequestsController } from './table-booking-requests.controller';
import { TableBookingRequestsService } from './table-booking-requests.service';
import { TableBookingLogger } from './table-booking-requests.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableBookingRequest } from './entities/table-booking-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableBookingRequest])
  ],

  controllers: [TableBookingRequestsController],
  providers: [TableBookingRequestsService, TableBookingLogger]
})
export class TableBookingRequestsModule {}
