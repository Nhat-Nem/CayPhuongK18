import { Module } from '@nestjs/common';
import { RoomBookingRequestsController } from './room-booking-requests.controller';
import { RoomBookingRequestsService } from './room-booking-requests.service';
import { RoomBookingLogger } from './room-booking-requests.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomBookingRequest } from './entities/room-booking-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomBookingRequest])
  ],

  controllers: [RoomBookingRequestsController],
  providers: [RoomBookingRequestsService, RoomBookingLogger]
})
export class RoomBookingRequestsModule {}
