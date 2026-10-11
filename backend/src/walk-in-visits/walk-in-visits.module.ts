import { Module } from '@nestjs/common';
import { WalkInVisitsController } from './walk-in-visits.controller';
import { WalkInVisitsService } from './walk-in-visits.service';
import { WalkInLogger } from './walk-in-visits.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalkInVisit } from './entities/walk-in-visit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalkInVisit])
  ],

  controllers: [WalkInVisitsController],
  providers: [WalkInVisitsService, WalkInLogger]
})
export class WalkInVisitsModule {}
