import { IsOptional, IsString } from "class-validator";

export class CreateRoomStayDto {
    @IsString()
    roomId: string

    @IsOptional()
    @IsString()
    bookingRequestId?: string

    @IsOptional()
    @IsString()
    walkInVisitId?: string
}