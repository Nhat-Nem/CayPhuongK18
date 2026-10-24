import { IsBoolean } from "class-validator";

export class UpdateReviewFeatureDto {
    @IsBoolean()
    isFeatured: boolean
}