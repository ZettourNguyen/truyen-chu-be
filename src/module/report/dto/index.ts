import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from "class-validator";

export class CreateReport {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    @IsInt()
    novelId: number;

    @IsOptional()
    @IsInt()
    commentId?: number | null;

    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    content: string;
}