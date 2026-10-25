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
import { ReportsModule } from './reports/reports.module';
import { RoomStaysModule } from './room-stays/room-stays.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
          type: 'mysql' as const,
          host: configService.get<string>('DB_HOST'),
          port: Number(configService.get<string>('DB_PORT') ?? 3306),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),

          autoLoadEntities: true,
          synchronize: true,
      }),
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

    ReportsModule,

    RoomStaysModule,

    UserModule,
  ],
  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
