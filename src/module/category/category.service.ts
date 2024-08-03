import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { capitalizeWords, formatString, replaceMultipleSpacesAndTrim } from 'src/utils/word';
import { NovelService } from '../novel/novel.service';
import { count } from 'console';
import { CreateCategoryDTO } from './dto/createDTO';
import { RoleService } from '../role/role.service';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService,
        private readonly novelService: NovelService,
        private readonly roleService: RoleService
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
        return this.prisma.category.findMany({
            orderBy: { name: "asc" }
        });
    }

    async findOne(name: string) {
        return this.prisma.category.findFirst({
            where: { name: name },
        });
    }

    async listNovels(id: number) {
        const categoryName = await this.getCategoryName(id)

        const listNovels = await this.novelService.findManyNovelsByCategoryId(id)

        return { categoryName, count: listNovels.length, listNovels }
    }

    async update(id: number, userId: number, name: string, description: string) {
        await this.roleService.checkPermission(userId, "Category")
        const inputName = replaceMultipleSpacesAndTrim(formatString(name))  //
        const nameFormatted = capitalizeWords(inputName)
        const category = await this.prisma.category.findFirst({
            where: { name: inputName }
        })
        if (!category) {
            await this.validateCategoryName(inputName);
        }
        const inputDescription = replaceMultipleSpacesAndTrim(formatString(description))  //

        return this.prisma.category.update({
            where: { id },
            data: {
                name: nameFormatted,
                description: inputDescription
            },
        });
    }

    async remove(userId: number, categoryId: number) {
        await this.roleService.checkPermission(userId, "Category")
        const category = await this.prisma.category.findUnique({
            where: {
                id: categoryId
            }
        })
        if (!category) {
            throw new NotFoundException(`Không tồn tại thể loại ${category.name}`)
        }
        return this.prisma.category.delete({
            where: { id: categoryId },
        });
    }

    // =============================== CategoryName service ==================================
    // =============================== CategoryName service ==================================
    // =============================== CategoryName service ==================================


}
