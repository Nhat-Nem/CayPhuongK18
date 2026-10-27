import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";

export class CreateGalleryDto {
    @IsString()
    @IsNotEmpty()
    imageBase64: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    caption?: string

    @IsOptional()
    @IsBoolean()
    isActive: boolean

    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number
}