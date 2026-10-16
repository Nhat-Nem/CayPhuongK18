import { Module } from '@nestjs/common';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsLogger } from './menu-items.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { Category } from '../category/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItem, Category])
  ],

  controllers: [MenuItemsController],
  providers: [MenuItemsService, MenuItemsLogger]
})
export class MenuItemsModule {}
