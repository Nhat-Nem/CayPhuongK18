import { IsEnum } from 'class-validator';

export enum BookingRequestStatus {
    PENDING = 'PENDING',
    CONTACTED = 'CONTACTED',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

export class UpdateBookingRequestStatusDTO {
    @IsEnum(BookingRequestStatus)
    status: BookingRequestStatus;
}