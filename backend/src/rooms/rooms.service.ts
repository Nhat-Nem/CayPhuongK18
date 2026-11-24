import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RoomsLogger } from './rooms.logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDTO } from './dto/create-room.dto';
import { UpdateRoomDTO } from './dto/update-room.dto';
import { RoomStay, RoomStayStatus } from '../room-stays/entities/room-stay.entity';

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
    async deleteRoom(id: number) {
        const room = await this.roomRepository.findOne({
            where: { id },
            withDeleted: true
        })

        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`)
        }

        if (room.deletedAt) {
            throw new BadRequestException(`Room has already been deleted`);
        }

        const activeStay = await this.roomRepository.manager
            .getRepository(RoomStay)
            .findOne({
                where: {
                    roomId: String(id),
                    status: RoomStayStatus.CHECKED_IN
                }
            })

        if (activeStay) {
            throw new BadRequestException(`Cannot delete a room that is current occupied`)
        }

        await this.roomRepository.softDelete(id)
        
        this.roomsLogger.log(`Delete room ID ${id} successfully at ${this.getCurrentTime()}`);

        return {
            message: `Room with id ${id} deleted successfully`
        }
    }

    // Restore
    async restoreRoom(id: number) {
        const room = await this.roomRepository.findOne({
            where: { id },
            withDeleted: true
        })

        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`)
        }

        if (!room.deletedAt) {
            throw new BadRequestException(`Room is not deleted`)
        }

        await this.roomRepository.restore(id)

        this.roomsLogger.log(`Restore ${id} successfully at ${this.getCurrentTime()}`)

        return { message: `Room with id ${id} restored successfully` }
    }
}
