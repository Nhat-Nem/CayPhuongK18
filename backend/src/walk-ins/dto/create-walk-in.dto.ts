import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { WalkInServiceType } from "../entities/walk-in.entity";

export class CreateWalkInDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @IsEnum(WalkInServiceType)
  service: WalkInServiceType;

  @IsInt()
  @Min(1)
  guests: number;

  @IsOptional()
  @IsInt()
  roomId?: number | null;

  @IsOptional()
  @IsString()
  note?: string | null;
}
