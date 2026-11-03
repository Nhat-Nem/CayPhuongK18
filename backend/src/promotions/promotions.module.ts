import { Module } from '@nestjs/common';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { PromotionsLogger } from './promotions.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promotion]),
    AuthModule
  ],

  controllers: [PromotionsController],
  providers: [PromotionsService, PromotionsLogger]
})
export class PromotionsModule {}
