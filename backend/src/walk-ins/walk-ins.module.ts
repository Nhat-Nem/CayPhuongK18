import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Room } from "../rooms/entities/room.entity";
import { WalkIn } from "./entities/walk-in.entity";
import { WalkInsController } from "./walk-ins.controller";
import { WalkInsService } from "./walk-ins.service";

@Module({
  imports: [TypeOrmModule.forFeature([WalkIn, Room])],
  controllers: [WalkInsController],
  providers: [WalkInsService],
})
export class WalkInsModule {}
