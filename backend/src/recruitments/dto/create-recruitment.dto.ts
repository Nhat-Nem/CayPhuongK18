import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateRecruitmentDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(2147483647)
    quantity?: number

    @IsOptional()
    @IsString()
    @MaxLength(100)
    salary?: string

    @IsOptional()
    @IsString()
    @MaxLength(50)
    employment_type?: string

    @IsOptional()
    @IsString()
    @MaxLength(255)
    location?: string

    @IsOptional()
    @IsString()
    requirements?: string

    @IsOptional()
    @IsString()
    benefits?: string

    @IsOptional()
    @IsDateString()
    deadline?: string

    @IsOptional()
    @IsString()
    @MaxLength(50)
    status?: string
}