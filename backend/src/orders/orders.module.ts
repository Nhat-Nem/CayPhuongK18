import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { AuthModule } from '../auth/auth.module';
import { OrdersLogger } from './orders.logger';
import { Promotion } from '../promotions/entities/promotion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      MenuItem,
      Promotion
    ]),
    AuthModule
  ],

  controllers: [OrdersController],
  providers: [OrdersService, OrdersLogger],
  exports: [OrdersService]
})
export class OrdersModule {}
