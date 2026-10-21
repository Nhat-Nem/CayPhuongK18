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
        this.recruitmentLogger.log(`Get all recruitments sucessfully at ${this.getCurrentTime()}`)

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

        this.recruitmentLogger.log(`Get recruiments id ${id} successfully at ${this.getCurrentTime()}`)

        return recruiment
    }

    // Tao
    async create(dto: CreateRecruitmentDto) {
        const recruitment = this.recruitmentReposiroty.create(dto)

        this.recruitmentLogger.log(`Create recruitment successfully at ${this.getCurrentTime()}`)
        
        return this.recruitmentReposiroty.save(recruitment)
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

        this.recruitmentLogger.log(`Update recruitment successfully at ${this.getCurrentTime()}`)

        return this.recruitmentReposiroty.save(recruitment)
    }

    // Remove
    async remove(id: string) {
        const recruitment = await this.findOne(id)

        if (!recruitment) {
            throw new NotFoundException("Recruitment Not found")
        }

        await this.recruitmentReposiroty.remove(recruitment)

        this.recruitmentLogger.log(`Delete recruitment successfully`)

        return { message: "Delete recruitment successfully" }
    }
}
