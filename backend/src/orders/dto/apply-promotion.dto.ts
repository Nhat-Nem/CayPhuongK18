import { IsNotEmpty, IsString } from "class-validator";

export class ApplyPromotionDto {
    @IsString()
    @IsNotEmpty()
    promotionId: string
}