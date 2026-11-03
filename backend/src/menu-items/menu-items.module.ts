import { Module } from '@nestjs/common';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsLogger } from './menu-items.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { Category } from '../category/entities/category.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItem, Category]),
    AuthModule
  ],

  controllers: [MenuItemsController],
  providers: [MenuItemsService, MenuItemsLogger]
})
export class MenuItemsModule {}
