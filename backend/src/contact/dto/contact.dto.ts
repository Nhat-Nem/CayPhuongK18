
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateContactSettingsDTO {
    @IsOptional()
    @IsString()
    @MaxLength(20)
    hotline?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    zalo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    messenger?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;
}