import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from 'class-transformer';

export class CreateRoomDTO {
    @IsString()
    code: string;

    @IsString()
    name: string;
    
    @IsString()
    description: string;
    
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price: number;

    @IsString()
    status: string;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    capacity: number;

    @IsOptional()
    @IsString()
    image: string;

    @IsOptional()
    @IsString()
    secondaryImage: string;

    @IsOptional()
    @IsString()
    type?: string;
}
