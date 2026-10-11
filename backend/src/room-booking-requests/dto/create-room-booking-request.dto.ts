import {
  IsDateString, IsEmail, IsNotEmpty,
  IsOptional, IsString, MaxLength, Validate,
  ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'checkOutAfterCheckIn', async: false })
class CheckOutAfterCheckIn implements ValidatorConstraintInterface {
  validate(checkOut: string, args: ValidationArguments) {
    const dto = args.object as CreateRoomBookingRequestDto;

    return (
      typeof dto.checkIn === 'string' &&
      typeof checkOut === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(dto.checkIn) &&
      /^\d{4}-\d{2}-\d{2}$/.test(checkOut) &&
      !Number.isNaN(Date.parse(dto.checkIn)) &&
      !Number.isNaN(Date.parse(checkOut)) &&
      new Date(`${checkOut}T00:00:00Z`) >
        new Date(`${dto.checkIn}T00:00:00Z`)
    );
  }

  defaultMessage() {
    return 'Ngày trả phòng phải sau ngày nhận phòng';
  }
}

export class CreateRoomBookingRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  customerPhone: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  customerEmail?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  roomType: string;

  @IsDateString({ strict: true })
  @IsNotEmpty()
  checkIn: string;

  @IsDateString({ strict: true })
  @IsNotEmpty()
  @Validate(CheckOutAfterCheckIn)
  checkOut: string;

  @IsOptional()
  @IsString()
  note?: string;
}