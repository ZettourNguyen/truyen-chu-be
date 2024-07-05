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

    async findByName(name: string) {
        const author = await this.prisma.author.findMany({
            where: {
                name
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
        const tagName = await this.prisma.author.findFirst({
            where: {
                name: name,
            },
        });
        console.log(tagName)

        if (tagName) {
            throw new ForbiddenException(`Tag with name '${name}' already exists.`);
        }
    }

    async create(data: createAuthorDto): Promise<Author> {
        const authorName = replaceMultipleSpacesAndTrim(data.name)
        await this.validateAuthorName(authorName);  // ktra name(unique)

        const author = await this.prisma.author.create({ data: {name : authorName} });
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
}
