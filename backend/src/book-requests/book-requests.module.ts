import { Module } from '@nestjs/common';
import { BookRequestsController } from './book-requests.controller';
import { BookRequestsService } from './book-requests.service';
import { BookRequestLogger } from './book-request.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookRequest } from './entities/book-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookRequest])
  ],
  controllers: [BookRequestsController],
  providers: [BookRequestsService, BookRequestLogger]
})
export class BookRequestsModule {}
