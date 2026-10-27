import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GalleryImage } from './entities/gallery.entity';
import { Repository } from 'typeorm';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
    constructor(
        @InjectRepository(GalleryImage)
        private readonly galleryRepository: Repository<GalleryImage>
    ) {}

    // Customer: lya61 ảnh hiển thị
    async findPublic() {
        return this.galleryRepository.find({
            where: { isActive: true },
            order: {
                displayOrder: 'ASC',
                id: 'ASC'
            }
        })
    }

    // Admin: Lấy toàn bộ ảnh
    async findAll() {
        return this.galleryRepository.find({
            order: {
                displayOrder: 'ASC',
                id: 'ASC'
            }
        })
    }

    // Admin: thêm ảnh
    async create(dto: CreateGalleryDto) {
        const image = await this.galleryRepository.create(dto)

        return this.galleryRepository.save(image)
    }

    // Admin: Cập nhật ảnh
    async update(id: string, dto: UpdateGalleryDto) {
        const image = await this.galleryRepository.findOneBy({ id })
        
        if (!image) {
            throw new NotFoundException("Image Not Found")
        }

        Object.assign(image, dto)
        return this.galleryRepository.save(image)
    }

    // Admin: Xoá ảnh
    async remove(id: string) {
        const image = await this.galleryRepository.findOneBy({ id })

        if (!image) {
            throw new NotFoundException("Image Not Found")
        }

        await this.galleryRepository.remove(image)

        return { message: "Xoa anh thanh cong" }
    }
}
