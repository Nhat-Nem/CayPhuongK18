import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsLogger } from './rooms.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room])
  ],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsLogger]
})
export class RoomsModule {}
