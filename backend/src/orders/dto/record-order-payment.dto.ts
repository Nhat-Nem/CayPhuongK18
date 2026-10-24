import { IsEnum } from "class-validator";
import { PaymentMethod } from "../entities/order.entity";

export class RecordOrderPaymentDto {
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod
}