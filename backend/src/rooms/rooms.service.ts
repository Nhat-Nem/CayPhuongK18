import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomsLogger } from './rooms.logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDTO } from './dto/create-room.dto';
import { UpdateRoomDTO } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
    constructor(
        private readonly roomsLogger: RoomsLogger,
        
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // Lấy tất cả phòng
    async getAllRooms() {
        // Log ra console -> LOG: Get all rooms...
        this.roomsLogger.log(`Get all rooms at ${this.getCurrentTime()}`)
        return await this.roomRepository.find();
    }

    // Tìm phòng theo ID
    async getRoomById(id: number) {
        const room = await this.roomRepository.findOneBy({ id })
        
        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`)
        }

        // Log ra console -> LOG: Get room 'id' ... 
        this.roomsLogger.log(`Get room id ${id} successfully at ${this.getCurrentTime()}`)

        return room
    }

    // Tạo phòng
    // Input: CreateRoomDTO
    async createRoom(createRoomDto: CreateRoomDTO) {
        const room = this.roomRepository.create(createRoomDto)

        // Log ra console -> LOG: Create room... 
        this.roomsLogger.log(`Create room successfully at ${this.getCurrentTime()}`)

        return await this.roomRepository.save(room)
    }

    // Cập nhật phòng
    // Input: ID phòng + UpdateRoomDTO
    async updateRoom(id: number, updateRoomDto: UpdateRoomDTO) {
        const room = await this.roomRepository.preload({
            id, ...updateRoomDto
        })

        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`)
        }

        // Log ra console -> LOG: Update room 'id' ... 
        this.roomsLogger.log(`Update room id ${id} successfully at ${this.getCurrentTime()}`)

        return await this.roomRepository.save(room)
    }

    // Xóa phòng
    async deleteRoom(id: number) {
        const room = await this.roomRepository.findOneBy({ id })

        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`)
        }

        await this.roomRepository.remove(room)

        // Log ra console -> LOG: Delete room 'id' ... 
        this.roomsLogger.log(`Delete room ${id} successfully at ${this.getCurrentTime()}`);

        return {
            message: `Room with id ${id} deleted successfully`
        }
    }
}
