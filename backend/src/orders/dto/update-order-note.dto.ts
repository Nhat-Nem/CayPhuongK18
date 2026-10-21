import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateOrderNoteDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    note?: string | null
}