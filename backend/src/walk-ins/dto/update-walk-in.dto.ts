import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsOptional } from "class-validator";
import { CreateWalkInDTO } from "./create-walk-in.dto";
import { WalkInStatus } from "../entities/walk-in.entity";

export class UpdateWalkInDTO extends PartialType(CreateWalkInDTO) {
  @IsOptional()
  @IsEnum(WalkInStatus)
  status?: WalkInStatus;
}
