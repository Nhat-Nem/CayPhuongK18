import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsLogger } from './reviews.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review])
  ],

  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsLogger]
})
export class ReviewsModule {}
