import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RoomsModule } from "./rooms/rooms.module";
import { BookRequestsModule } from "./book-requests/book-requests.module";
import { ContactModule } from "./contact/contact.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Dùng ConfigService thay vì đọc process.env trực tiếp lúc file module
    // được import. Nhờ vậy .env luôn được nạp trước khi TypeORM kết nối.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "mysql" as const,
        host: config.get<string>("DB_HOST", "127.0.0.1"),
        port: Number(config.get<string>("DB_PORT", "3306")),
        username: config.get<string>("DB_USERNAME", "root"),
        password: config.get<string>("DB_PASSWORD", ""),
        database: config.get<string>("DB_DATABASE", "cayphuong_k18"),
        autoLoadEntities: true,
        synchronize: config.get<string>("DB_SYNCHRONIZE", "true") === "true",
      }),
    }),

    RoomsModule,
    BookRequestsModule,
    ContactModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
