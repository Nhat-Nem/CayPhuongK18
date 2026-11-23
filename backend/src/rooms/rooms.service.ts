import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
        return await this.roomRepository.find();
    }

    // Tìm phòng theo ID
    async getRoomById(id: number) {
        const room = await this.roomRepository.findOneBy({ id })
        
        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`)
        }

        return room
    }

    // Tạo phòng
    // Input: CreateRoomDTO
    async createRoom(createRoomDto: CreateRoomDTO) {
        const room = this.roomRepository.create(createRoomDto)

        const result = await this.roomRepository.save(room)

        // Log ra console -> LOG: Create room... 
        this.roomsLogger.log(`Create room ID ${result.id} successfully at ${this.getCurrentTime()}`)

        return result
    }

    // Cập nhật phòng
    // Input: ID phòng + UpdateRoomDTO
    async updateRoom(id: number, updateRoomDto: UpdateRoomDTO) {
        const room = await this.roomRepository.findOneBy({ id });

        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`);
        }

        // Gộp dữ liệu cập nhật vào phòng hiện tại
        this.roomRepository.merge(room, updateRoomDto);

        // Lưu vào database
        const updatedRoom = await this.roomRepository.save(room);

        this.roomsLogger.log(
            `Update room ID ${id} successfully at ${this.getCurrentTime()}`
        );

        return updatedRoom;
    }

    // Xóa phòng
    // Condition: Chi xoa dc phong neu chua co lich sử sử dụng
    async deleteRoom(id: number) {
        const room = await this.roomRepository.findOneBy({ id })

        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`)
        }

        // Check if the room has a history of previous stays
        const hasRoomStay = await this.roomRepository.manager
            .getRepository('room_stays')
            .createQueryBuilder('roomStay')
            .where('roomStay.room_id = :id', { id })
            .getExists()

        if (hasRoomStay) {
            throw new BadRequestException(`Cannot Delete this room because it has stay history. Please deactivate it instead`)
        }
        
        await this.roomRepository.remove(room)

        // Log ra console -> LOG: Delete room 'id' ... 
        this.roomsLogger.log(`Delete room ID ${id} successfully at ${this.getCurrentTime()}`);

        return {
            message: `Room with id ${id} deleted successfully`
        }
    }
}
