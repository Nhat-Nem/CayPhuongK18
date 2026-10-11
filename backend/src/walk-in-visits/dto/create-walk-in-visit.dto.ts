import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateWalkInVisitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  customerPhone: string;

  @IsIn(['RESTAURANT', 'ROOM'])
  serviceType: string;

  @IsInt()
  @Min(1)
  guestCount: number;

  @ValidateIf((o) => o.serviceType === 'ROOM')
  @IsString()
  @IsNotEmpty()
  roomId?: string;

  @ValidateIf((o) => o.serviceType === 'RESTAURANT')
  @IsOptional()
  @IsString()
  restaurantRoomId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}