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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production.local'
          : '.env',
    }),

    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_DATABASE');

        const portValue = configService.get<string>('DB_PORT');
        const port = portValue ? Number(portValue) : 4000;

        if (!host || !username || !password || !database) {
          throw new Error('Thiếu biến môi trường kết nối database');
        }

        if (!Number.isInteger(port) || port < 1 || port > 65535) {
          throw new Error('DB_PORT không hợp lệ');
        }

        return {
          type: 'mysql' as const,
          host,
          port,
          username,
          password,
          database,

          // Bắt buộc TLS khi kết nối TiDB Cloud
          ssl: {
            minVersion: 'TLSv1.2' as const,
            rejectUnauthorized: true,
          },

          autoLoadEntities: true,
          synchronize: false,
        };
      },
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
