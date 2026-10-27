import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryImage } from './entities/gallery.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GalleryImage]),
    AuthModule
  ],

  controllers: [GalleryController],
  providers: [GalleryService]
})
export class GalleryModule {}
