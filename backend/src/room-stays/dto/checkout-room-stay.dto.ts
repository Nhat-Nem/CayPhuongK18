import { IsEnum } from "class-validator";
import { RoomStayPaymentMethod } from "../entities/room-stay.entity";

export class CheckoutRoomStayDto {
    @IsEnum(RoomStayPaymentMethod)
    paymentMethod: RoomStayPaymentMethod
}