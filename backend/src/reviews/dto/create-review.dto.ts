import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  customerPhone: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  customerEmail?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  note?: string;
}