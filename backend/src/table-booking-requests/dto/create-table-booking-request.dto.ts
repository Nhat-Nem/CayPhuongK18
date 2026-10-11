import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateTableBookingRequestDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    customerName: string

    @IsString()
    @IsNotEmpty()
    @MaxLength(15)
    customerPhone: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    customerEmail?: string;

    @IsOptional()
    @IsString()
    note?: string
}