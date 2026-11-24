import { IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";

export class CreateOrderDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    note?: string

    @ValidateIf((o) => !o.roomNumber)
    @IsString()
    @IsOptional()
    tableNumber?: string

    @ValidateIf((o) => !o.tableNumber)
    @IsString()
    @IsOptional()
    roomNumber?: string
}