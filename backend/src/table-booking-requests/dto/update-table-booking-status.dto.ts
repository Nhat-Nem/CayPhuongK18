import { IsEnum } from "class-validator";
import { TableBookingStatus } from "../entities/table-booking-request.entity";

export class UpdateTableBookingStatusDto {
    @IsEnum(TableBookingStatus)
    status: TableBookingStatus
}