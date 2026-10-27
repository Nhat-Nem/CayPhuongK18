import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Controller('gallery')
export class GalleryController {
    constructor(
        private readonly galleryService: GalleryService
    ) {}

    // Public
    @Get()
    findPublic() {
        return this.galleryService.findPublic()
    }

    // admin xem anh
    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    findAll() {
        return this.galleryService.findAll()
    }

    // Admin: them anh
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    create(@Body() dto: CreateGalleryDto) {
        return this.galleryService.create(dto)
    }

    // Admin: update
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIn")
    update(
        @Param('id') id: string,
        @Body() dto: UpdateGalleryDto
    ) {
        return this.galleryService.update(id, dto)
    }

    // Admin: Xoa anh
    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.galleryService.remove(id)
    }
}
