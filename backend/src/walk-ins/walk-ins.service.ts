import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateWalkInDTO } from "./dto/create-walk-in.dto";
import { UpdateWalkInDTO } from "./dto/update-walk-in.dto";
import {
  WalkIn,
  WalkInServiceType,
} from "./entities/walk-in.entity";
import { Room } from "../rooms/entities/room.entity";

@Injectable()
export class WalkInsService {
  constructor(
    @InjectRepository(WalkIn)
    private readonly walkInRepository: Repository<WalkIn>,

    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async findAll() {
    return this.walkInRepository.find({
      order: { id: "DESC" },
    });
  }

  async findOne(id: number) {
    const walkIn = await this.walkInRepository.findOneBy({ id });

    if (!walkIn) {
      throw new NotFoundException(`Walk-in with id ${id} not found`);
    }

    return walkIn;
  }

  private async validateRoom(
    service: WalkInServiceType,
    roomId?: number | null,
  ) {
    if (service === WalkInServiceType.RESTAURANT) {
      return null;
    }

    if (roomId === undefined || roomId === null) {
      return null;
    }

    const room = await this.roomRepository.findOneBy({ id: roomId });

    if (!room) {
      throw new BadRequestException(`Room with id ${roomId} not found`);
    }

    return roomId;
  }

  async create(dto: CreateWalkInDTO) {
    const roomId = await this.validateRoom(dto.service, dto.roomId);

    const walkIn = this.walkInRepository.create({
      fullName: dto.fullName.trim(),
      phone: dto.phone.trim(),
      service: dto.service,
      guests: dto.guests,
      roomId,
      note: dto.note?.trim() || null,
    });

    // Save lần 1 để MySQL cấp id.
    const saved = await this.walkInRepository.save(walkIn);

    // Mã nghiệp vụ ổn định dựa trên id, không phụ thuộc timestamp.
    saved.code = `VL-${String(saved.id).padStart(6, "0")}`;

    return this.walkInRepository.save(saved);
  }

  async update(id: number, dto: UpdateWalkInDTO) {
    const walkIn = await this.findOne(id);

    const nextService = dto.service ?? walkIn.service;
    const requestedRoomId =
      dto.roomId === undefined ? walkIn.roomId : dto.roomId;
    const roomId = await this.validateRoom(nextService, requestedRoomId);

    const changes: Partial<WalkIn> = {
      roomId,
    };

    if (dto.fullName !== undefined) changes.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) changes.phone = dto.phone.trim();
    if (dto.service !== undefined) changes.service = dto.service;
    if (dto.guests !== undefined) changes.guests = dto.guests;
    if (dto.status !== undefined) changes.status = dto.status;
    if (dto.note !== undefined) changes.note = dto.note?.trim() || null;

    this.walkInRepository.merge(walkIn, changes);

    return this.walkInRepository.save(walkIn);
  }

  async remove(id: number) {
    const walkIn = await this.findOne(id);
    await this.walkInRepository.remove(walkIn);

    return {
      message: `Walk-in with id ${id} deleted successfully`,
    };
  }
}
