import { Module } from '@nestjs/common';
import { RoomStaysService } from './room-stays.service';
import { RoomStaysController } from './room-stays.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomStay } from "./entities/room-stay.entity"
import { Room } from '../rooms/entities/room.entity';
import { RoomBookingRequest } from '../room-booking-requests/entities/room-booking-request.entity';
import { WalkInVisit } from '../walk-in-visits/entities/walk-in-visit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomStay,
      Room,
      RoomBookingRequest,
      WalkInVisit 
    ])
  ],

  providers: [RoomStaysService],
  controllers: [RoomStaysController],
  exports: [RoomStaysService]
})
export class RoomStaysModule {}
