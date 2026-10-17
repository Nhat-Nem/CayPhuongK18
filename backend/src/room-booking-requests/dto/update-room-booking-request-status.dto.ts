import { IsEnum } from 'class-validator';

export enum RoomBookingRequestStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export class UpdateRoomBookingRequestStatusDto {
    @IsEnum(RoomBookingRequestStatus)
    status: RoomBookingRequestStatus;
}