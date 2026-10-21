import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { BookRequestsModule } from './book-requests/book-requests.module';
import { ContactModule } from './contact/contact.module';
import { AuthModule } from './auth/auth.module';
import { TableBookingRequestsModule } from './table-booking-requests/table-booking-requests.module';
import { RoomBookingRequestsModule } from './room-booking-requests/room-booking-requests.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WalkInVisitsModule } from './walk-in-visits/walk-in-visits.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { CategoryModule } from './category/category.module';
import { RecruitmentsModule } from './recruitments/recruitments.module';
import { PromotionsModule } from './promotions/promotions.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      autoLoadEntities: true,
      synchronize: true
    }),

    RoomsModule,

    BookRequestsModule,

    ContactModule,

    AuthModule,

    TableBookingRequestsModule,

    RoomBookingRequestsModule,

    ReviewsModule,

    WalkInVisitsModule,

    MenuItemsModule,

    CategoryModule,

    RecruitmentsModule,

    PromotionsModule,

    OrdersModule,
  ],
  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
