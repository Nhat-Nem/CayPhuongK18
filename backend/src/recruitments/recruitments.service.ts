import { Injectable, NotFoundException } from '@nestjs/common';
import { RecruitmentLogger } from './recruitments.logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Recruitment } from './entities/recruitment.entity';
import { Repository } from 'typeorm';
import { CreateRecruitmentDto } from './dto/create-recruitment.dto';
import { UpdateRecruitmentDto } from './dto/update-recruitment.dto';

@Injectable()
export class RecruitmentsService {
    constructor(
        private readonly recruitmentLogger: RecruitmentLogger,

        @InjectRepository(Recruitment)
        private readonly recruitmentReposiroty: Repository<Recruitment>
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // lay tat ca
    async findAll() {
        return this.recruitmentReposiroty.find({
            order: { createdAt: "DESC" }
        })
    }

    // Tim theo id
    async findOne(id: string) {
        const recruiment = await this.recruitmentReposiroty.findOne({
            where: { id }
        })

        if (!recruiment) {
            throw new NotFoundException("Recruitment Not Found")
        }

        return recruiment
    }

    // Tao
    async create(dto: CreateRecruitmentDto) {
        const recruitment = this.recruitmentReposiroty.create({
            ...dto, 
            employmentType: dto.employment_type
        })

        const result = await this.recruitmentReposiroty.save(recruitment)

        this.recruitmentLogger.log(`Create recruitment ID ${result.id} successfully at ${this.getCurrentTime()}`)
        
        return result
    }

    // Update
    async update(id: string, dto: UpdateRecruitmentDto) {
        const recruitment = await this.findOne(id)

        if (!recruitment) {
            throw new NotFoundException("Recruitment Not Found")
        }

        Object.assign(recruitment, {
            ...dto, 
            employmentType: 
                dto.employment_type ?? recruitment.employmentType
        })

        const result = await this.recruitmentReposiroty.save(recruitment)

        this.recruitmentLogger.log(`Update recruitment ID ${id} successfully at ${this.getCurrentTime()}`)

        return result
    }

    // Remove
    async remove(id: string) {
        const recruitment = await this.findOne(id)

        if (!recruitment) {
            throw new NotFoundException("Recruitment Not found")
        }

        await this.recruitmentReposiroty.remove(recruitment)

        this.recruitmentLogger.log(`Delete recruitment ID ${id} successfully at ${this.getCurrentTime()}`)

        return { message: "Delete recruitment successfully" }
    }
}
