import { Body, Controller, Delete, Get, Param, Patch, Query, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { AuthorService } from './author.service';
import { AuthorUpdateDto } from './dto/author.dto';

@Controller('author')
@UseFilters(HttpExceptionFilter)
export class AuthorController {
    constructor(private readonly authorService: AuthorService){}

    @Get('novel/:id')
    async findAuthorByNovelId(@Param('id') id: string) {
        return this.authorService.findAuthorByNovelId(+id);
    }

    @Get()
    async findAll(){
        return this.authorService.findAll()
    }
    @Get('name/:id')
    async getName(@Param('id') id: string){
        const author = await this.authorService.findById(+id)
        return author.nickname
    }
    @Delete(':userId')
    async delete(
        @Param('userId') userId: number, // Sử dụng 'userId' thay vì ':userId'
        @Query('authorId') authorId: number
    ) {
        return this.authorService.delete(+userId, +authorId);
    }
    @Patch(':id')
    async updateAuthor(
        @Param('id') id: string,
        @Body() updateAuthorDto: AuthorUpdateDto
    ) {
        return this.authorService.updateAuthor(+id, updateAuthorDto);
    }
}
