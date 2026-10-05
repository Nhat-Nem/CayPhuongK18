import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDTO } from './dto/create-room.dto';
import { UpdateRoomDTO } from './dto/update-room.dto';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomService: RoomsService) {}

    // METHOD: GET '/' -> Lấy tất cả phòng
    @Get()
    getAllRooms() {
        return this.roomService.getAllRooms()
    }

    // METHOD: GET '/:id' -> Lấy phòng theo ID
    @Get(":id")
    getRoomById(@Param('id') id: string) {
        return this.roomService.getRoomById(+id)
    }

    // METHOD: POST '/' -> Tạo phòng
    @Post()
    createRoom(@Body() createRoomDto: CreateRoomDTO) {
        return this.roomService.createRoom(createRoomDto)
    }

    // METHOD: PATCH '/:id' -> Cập nhật phòng
    @Patch(':id')
    updateRoom(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDTO) {
        return this.roomService.updateRoom(+id, updateRoomDto)
    }

    // METHOD: DELETE '/:id' -> Xóa phòng
    @Delete(":id")
    deleteRoom(@Param('id') id: string) {
        return this.roomService.deleteRoom(+id)
    }
}
