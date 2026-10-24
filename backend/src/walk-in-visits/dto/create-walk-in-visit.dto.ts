import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateWalkInVisitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/.*[a-zA-ZÀ-ỹ].*/, {
    message: 'Tên khách phải chứa chữ cái',
  })
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^0\d{9}$/, {
    message: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0',
  })
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