import { Controller, Get, Param, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { AuthorService } from './author.service';

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
}
