import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    IsEnum,
    IsNumber,
    Min,
} from 'class-validator';

import {
    PromotionStatus,
    PromotionType,
    PromotionAppliesTo,
} from '../entities/promotion.entity';

export class CreatePromotionDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsEnum(PromotionType)
    discountType: PromotionType;

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    discountValue: number;

    @IsNotEmpty()
    @IsEnum(PromotionAppliesTo)
    appliesTo: PromotionAppliesTo;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsEnum(PromotionStatus)
    status?: PromotionStatus;
}
