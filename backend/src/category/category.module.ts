import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryLogger } from './category.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category])
  ],

  controllers: [CategoryController],
  providers: [CategoryService, CategoryLogger]
})
export class CategoryModule {}
