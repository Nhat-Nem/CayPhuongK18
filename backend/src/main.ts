import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DataSource } from "typeorm";
import { json, urlencoded } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ảnh phòng được frontend nén thành data URL và gửi trong JSON.
  app.use(json({ limit: "5mb" }));
  app.use(urlencoded({ extended: true, limit: "5mb" }));

  // API của dự án dùng prefix /api/v1.
  app.setGlobalPrefix("api/v1");

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_DEV_URL,
      "http://localhost:5173",
    ].filter(Boolean) as string[],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  const port = Number(process.env.PORT || 8080);

  await app.listen(port);

  console.log(`Server is running at: http://localhost:${port}/api/v1`);

  const dataSource = app.get(DataSource);
  console.log(
    dataSource.isInitialized
      ? "Connect DB thành công"
      : "Connect DB thất bại",
  );
}

void bootstrap();
