import { IsString, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';

export class ChapterCreateDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    @IsNotEmpty()
    novelId: number;

    @IsNumber()
    @IsNotEmpty()
    index: number;

    @IsBoolean()
    @IsNotEmpty()
    isPublish: boolean;

    @IsNumber()
    @IsNotEmpty()
    chapterLength: number;
}
