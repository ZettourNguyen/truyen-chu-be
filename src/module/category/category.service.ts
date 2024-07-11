import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { capitalizeWords, formatString, replaceMultipleSpacesAndTrim } from 'src/utils/word';
import { NovelService } from '../novel/novel.service';
import { count } from 'console';
import {  CreateCategoryDTO } from './dto/createDTO';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService,
        private readonly novelService: NovelService
    ) { }

    async getCategoryName(id: number) {
        const categoryName = await this.prisma.category.findUnique({
            where: {
                id
            }
        })
        if (!categoryName) {
            throw new NotFoundException(`Not found ${id} category`)
        }
        return categoryName.name
    }

    async validateCategoryName(name: string) {
        const categoryName = await this.prisma.category.findFirst({
            where: {
                name: name,
            },
        });
        console.log(categoryName)

        if (categoryName) {
            throw new ForbiddenException(`Category with name '${name}' already exists.`);
        }
    }

    async create(data: CreateCategoryDTO) {
        const inputName = replaceMultipleSpacesAndTrim(formatString(data.name))  //
        const description = replaceMultipleSpacesAndTrim(formatString(data.description))
        await this.validateCategoryName(inputName);

        const nameFormatted = capitalizeWords(inputName)
        return this.prisma.category.create({
            data: {
                name: nameFormatted,
                description: description
            },
        });
    }

    async findAll() {
        return this.prisma.category.findMany();
    }

    async findOne(name: string) {
        return this.prisma.category.findFirst({
            where: { name: name },
        });
    }

    async listNovels(id:number){
        const categoryName = await this.getCategoryName(id)

        const listNovels = await this.novelService.findManyNovelsByCategoryId(id)

        return{ categoryName, count: listNovels.length, listNovels}
    }

    async update(id: number, name: string, description: string) {
        const inputName = replaceMultipleSpacesAndTrim(formatString(name))  //
        await this.validateCategoryName(inputName);

        const nameFormatted = capitalizeWords(inputName)
        return this.prisma.category.update({
            where: { id },
            data: {
                name: nameFormatted,
                description: description
            },
        });
    }

    async remove(id: number) {
        return this.prisma.category.delete({
            where: { id },
        });
    }

    // =============================== CategoryName service ==================================
    // =============================== CategoryName service ==================================
    // =============================== CategoryName service ==================================

    
}
