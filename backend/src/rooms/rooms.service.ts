import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { RoomsLogger } from "./rooms.logger";
import { Room } from "./entities/room.entity";
import { CreateRoomDTO } from "./dto/create-room.dto";
import { UpdateRoomDTO } from "./dto/update-room.dto";

@Injectable()
export class RoomsService {
  constructor(
    private readonly roomsLogger: RoomsLogger,

    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  private getCurrentTime() {
    return new Date().toLocaleString(
      "vi-VN",
      {
        timeZone:
          "Asia/Ho_Chi_Minh",
      },
    );
  }

  // GET /rooms
  async getAllRooms() {
    this.roomsLogger.log(
      `Get all rooms at ${this.getCurrentTime()}`,
    );

    return await this.roomRepository.find();
  }

  // GET /rooms/:id
  async getRoomById(id: number) {
    const room =
      await this.roomRepository.findOneBy({
        id,
      });

    if (!room) {
      throw new NotFoundException(
        `Room with id ${id} not found`,
      );
    }

    this.roomsLogger.log(
      `Get room id ${id} successfully at ${this.getCurrentTime()}`,
    );

    return room;
  }

  // POST /rooms
  async createRoom(
    createRoomDto: CreateRoomDTO,
  ) {
    const room =
      this.roomRepository.create(
        createRoomDto,
      );

    const savedRoom =
      await this.roomRepository.save(
        room,
      );

    this.roomsLogger.log(
      `Create room id ${savedRoom.id} successfully at ${this.getCurrentTime()}`,
    );

    return savedRoom;
  }

  // PATCH /rooms/:id
  async updateRoom(
    id: number,
    updateRoomDto: UpdateRoomDTO,
  ) {
    /*
     * Không dùng preload().
     *
     * Tìm phòng bằng cùng cách với
     * getRoomById để tránh trường hợp
     * BIGINT tồn tại nhưng preload()
     * trả undefined.
     */
    const room =
      await this.roomRepository.findOneBy({
        id,
      });

    if (!room) {
      throw new NotFoundException(
        `Room with id ${id} not found`,
      );
    }

    /*
     * Merge chỉ các field được gửi
     * từ frontend vào entity hiện tại.
     */
    this.roomRepository.merge(
      room,
      updateRoomDto,
    );

    const updatedRoom =
      await this.roomRepository.save(
        room,
      );

    this.roomsLogger.log(
      `Update room id ${id} successfully at ${this.getCurrentTime()}`,
    );

    return updatedRoom;
  }

  // DELETE /rooms/:id
  async deleteRoom(id: number) {
    const room =
      await this.roomRepository.findOneBy({
        id,
      });

    if (!room) {
      throw new NotFoundException(
        `Room with id ${id} not found`,
      );
    }

    await this.roomRepository.remove(
      room,
    );

    this.roomsLogger.log(
      `Delete room ${id} successfully at ${this.getCurrentTime()}`,
    );

    return {
      message: `Room with id ${id} deleted successfully`,
    };
  }
}