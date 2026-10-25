import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string

    @IsEmail()
    email: string

    @IsString()
    @MinLength(6)
    password: string

    @IsString()
    @IsNotEmpty()
    full_name: string

    @IsOptional()
    @IsString()
    phone?: string
}