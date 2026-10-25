import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

     async findAll() {
        const users = await this.userRepository.find({
            order: { id: 'ASC' },
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                phone: true,
                role: true,
                is_activate: true,
            }
        });

        return users;
    }

    async findOne(id: string) {
        const user = await this.userRepository.findOne({ 
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                phone: true,
                role: true,
                is_activate: true,
            }
        })

        if (!user) {
            throw new NotFoundException("User not found")
        }

        return user
    }

    async create(dto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10)

        const user = this.userRepository.create({
            ...dto,
            password: hashedPassword
        })

        const savedUser = await this.userRepository.save(user)

        return this.findOne(savedUser.id)
    }

    async update(id: string, dto: UpdateUserDto) {
        const user = await this.userRepository.findOne({
            where: { id }
        })

        if (!user) {
            throw new NotFoundException("User not found")
        }

        const updateData = {...dto}

        if (dto.password) {
            updateData.password = await bcrypt.hash(dto.password, 10)
        }

        Object.assign(user, updateData)

        await this.userRepository.save(user)

        return this.findOne(id)
    }

    async remove(id: string) {
        const user = await this.userRepository.findOne({
            where: { id }
        })

        if (!user) {
            throw new NotFoundException("User not found")
        }

        await this.userRepository.delete(user)

        return { message: "User deleted successfully" }
    }
}
