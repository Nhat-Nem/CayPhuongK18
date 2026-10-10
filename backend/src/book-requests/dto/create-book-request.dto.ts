import {IsNotEmpty, IsEmail, IsOptional, IsString, MaxLength, Max} from 'class-validator'

export class CreateBookRequestDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    customer_name: string

    @IsNotEmpty()
    @IsString()
    @MaxLength(15)
    customer_phone: string

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    customer_email: string

    @IsOptional()
    @IsString()
    note?: string
}