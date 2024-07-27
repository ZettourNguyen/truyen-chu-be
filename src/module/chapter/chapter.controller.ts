import { Body, Controller, Get, Param, Post, Put, UseFilters } from '@nestjs/common';
import { ChapterService } from './chapter.service'; // Điều chỉnh đường dẫn import tương ứng
import { Prisma } from '@prisma/client';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { ChapterCreateDto } from './dto';


@Controller('chapter')
@UseFilters(HttpExceptionFilter)
export class ChapterController {
    constructor(private chapterService: ChapterService) {}

    @Post('')
    async getChapterIndexes(@Body()data: ChapterCreateDto ){
        return this.chapterService.create(data)
    }

    @Put(':id')
    async updateIsPublish(@Param("id") id:string, @Body()data: Prisma.ChapterUpdateInput ){
        return this.chapterService.update(+id, data)
    }

    @Get(':id')
    async getChapterContent(@Param("id") id:string){
        return this.chapterService.getChapterContent(+id)
    }

    @Get('novelAll/:novelId')
    async findAllChapterOfNovel(@Param("novelId") novelId:string){
        const publishedOnly = false
        return this.chapterService.findAllChaptersOfNovel(+novelId, publishedOnly)
    }
    @Get('novelRead/:novelId')
    async findAllChapterOfNovelForRead(@Param("novelId") novelId:string){
        const publishedOnly = true
        return this.chapterService.findAllChaptersOfNovel(+novelId, publishedOnly)
    }
    @Get('publish/:novelId')
    async getNextIndexChapter(@Param("novelId") novelId:string){
        return this.chapterService.getNextIndexChapter(+novelId)
    }

    
}
