import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateWalkInDTO } from "./dto/create-walk-in.dto";
import { UpdateWalkInDTO } from "./dto/update-walk-in.dto";
import { WalkInsService } from "./walk-ins.service";

@Controller("walk-ins")
export class WalkInsController {
  constructor(private readonly walkInsService: WalkInsService) {}

  @Get()
  getAll() {
    return this.walkInsService.findAll();
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.walkInsService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateWalkInDTO) {
    return this.walkInsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateWalkInDTO) {
    return this.walkInsService.update(Number(id), dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.walkInsService.remove(Number(id));
  }
}
