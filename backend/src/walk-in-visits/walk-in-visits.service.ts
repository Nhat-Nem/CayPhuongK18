import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { WalkInLogger } from './walk-in-visits.logger';
import { InjectRepository } from '@nestjs/typeorm';
import { WalkInVisit } from './entities/walk-in-visit.entity';
import { Repository } from 'typeorm';
import { CreateWalkInVisitDto } from './dto/create-walk-in-visit.dto';

@Injectable()
export class WalkInVisitsService {
    constructor(
        private readonly walkInLogger: WalkInLogger,

        @InjectRepository(WalkInVisit)
        private readonly walkInVisitRepository: Repository<WalkInVisit>
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // tim het
    async findAll() {
        this.walkInLogger.log(`GET all walk in visits at ${this.getCurrentTime()}`)

        return this.walkInVisitRepository.find({
            order: {createdAt: "DESC"}
        })
    }

    // update
    async update(id: string, data: { status?: string }) {
        const visit = await this.walkInVisitRepository.findOneBy({ id })

        if (!visit) {
            throw new NotFoundException("Không tìm thấy lượt khách")
        }

        if (data.status !== undefined) {
            const allowedStatuses = [`PENDING`, `SERVING`, 'COMPLETED']

            if (!allowedStatuses.includes(data.status)) {
                throw new BadRequestException("Trạng thái không hợp lệ")
            }

            visit.status = data.status
        }

        this.walkInLogger.log(`Update walk in visit successfully at ${this.getCurrentTime()}`)

        return this.walkInVisitRepository.save(visit)
    }

    // xoa
    async remove(id: string) {
        const result = await this.walkInVisitRepository.delete(id)

        if (!result.affected) {
            throw new NotFoundException("Không tìm thấy lượt khách")
        }

        this.walkInLogger.log(`Delete walk in visit successfully at ${this.getCurrentTime()}`)

        return { message: "Xoá thành công" }
    }

    // tao
    async create(dto: CreateWalkInVisitDto) {
        if (dto.serviceType === "ROOM" && !dto.roomId) {
            throw new BadRequestException("Vui lòng chọn phòng")
        }

        if (dto.serviceType === "RESTAURANT" && dto.roomId) {
            throw new BadRequestException("Nhà hàng không cần chọn phòng")
        }

        const visit = this.walkInVisitRepository.create({
            ...dto,
            roomId: dto.serviceType === "ROOM" ? dto.roomId : null
        })

        this.walkInLogger.log(`Create Walk In Visit successfully at ${this.getCurrentTime()}`)
        
        return this.walkInVisitRepository.save(visit)
    }
}
