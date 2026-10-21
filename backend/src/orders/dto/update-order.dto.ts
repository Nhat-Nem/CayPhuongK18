import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { OrderStatus } from "../entities/order.entity";

export class UpdateOrderDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    note?: string | null

    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus
}