import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Author } from '@prisma/client';
import { PrismaService } from 'src/Prisma/prisma.service';
import { createAuthorDto, updateAuthorDto } from './dto/author.dto';
import { replaceMultipleSpacesAndTrim } from 'src/utils/word';

@Injectable()
export class AuthorService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<Author[]> {
        return this.prisma.author.findMany();
    }

    async findByName(nickname: string) {
        const author = await this.prisma.author.findMany({
            where: {
                nickname
            }
        })
        if (!author) {
            throw new NotFoundException(`Author with name ${name} not found`)
        }
        return author


    }

    async findById(id: number): Promise<Author | null> {
        const author = await this.prisma.author.findUnique({
            where: { id },
        });
        if (!author) {
            throw new NotFoundException(`Author with ID ${id} not found`);
        }
        return author;
    }

    async validateAuthorName(name: string) {
        const author = await this.prisma.author.findFirst({
            where: {
                nickname: name,
            },
        });
        console.log(author)

        if (author) {
            throw new ForbiddenException(`Author with name '${name}' already exists.`);
        }
        return author
    }

    async create(data: string, prisma: PrismaService): Promise<Author> {
        const authorName = replaceMultipleSpacesAndTrim(data)
        await this.validateAuthorName(authorName);  // ktra name(unique)
        
        const author = await prisma.author.create({ data: {nickname : authorName} });
        if(!author){
            throw new BadRequestException('Có lỗi trong quá trình tạo tác giả, vui lòng thử lại.');
        }
        return author
    }

    async update(id: number, data: updateAuthorDto): Promise<Author> {
        const author = await this.findById(id);
        if (!author) {
            throw new NotFoundException(`Author with ID ${id} not found`);
        }
        return this.prisma.author.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<Author> {
        const author = await this.findById(id);
        if (!author) {
            throw new NotFoundException(`Author with ID ${id} not found`);
        }
        return this.prisma.author.delete({
            where: { id },
        });
    }

    async createNovelAuthor(novelId : number, authorId: number, prisma: PrismaService){
        const existingAuthor = await prisma.author.findUnique({
            where: { id: authorId },
          });
          
          if (!existingAuthor) {
            throw new Error(`Author with id ${authorId} does not exist.`);
          }
        return await prisma.novelAuthor.create({
            data:{
                novelId,
                authorId
            }
        })
    }
}
