import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateMenuItemDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string

    @IsOptional()
    @IsString()
    description?: string

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price: number

    @IsOptional()
    @IsString()
    ingredient?: string

    @IsOptional()
    @IsString()
    @MaxLength(500)
    image?: string

    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId: number
}