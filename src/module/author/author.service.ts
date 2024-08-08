import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Author } from '@prisma/client';
import { PrismaService } from 'src/Prisma/prisma.service';
import { AuthorUpdateDto, createAuthorDto } from './dto/author.dto';
import { replaceMultipleSpacesAndTrim } from 'src/utils/word';
import { RoleService } from '../role/role.service';
import { use } from 'passport';

@Injectable()
export class AuthorService {
    constructor(private prisma: PrismaService,
        private readonly roleService: RoleService
    ) { }

    async findAll() {
        //  tác giả
        const authors = await this.prisma.author.findMany({
            include: {
                NovelAuthor: {
                    include: {
                        novel: true,
                    },
                },
            },
        });
    
        // số lượng novel cho từng tác giả
        const result = authors.map(author => ({
            ...author,
            novelCount: author.NovelAuthor.length,
        }));
    
        return result;
    }
    

    async findByName(nickname: string) {
        const author = await this.prisma.author.findMany({
            where: {
                nickname
            }
        })
        if (!author) {
            throw new NotFoundException(`Author with name ${nickname} not found`)
        }
        return author
    }

    async findAuthorByNovelId(novelId:number){
        const authorIds = await this.prisma.novelAuthor.findMany({
            where:{
                novelId
            },
            select:{
                authorId:true
            }
        })
        if (!authorIds) {
            throw new NotFoundException('No author here') 
        }
        const authors = await Promise.all(
            authorIds.map(async (authorId) => this.findById(authorId.authorId))
        );
        return authors
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
        return author
    }

    async create(data: string, prisma: PrismaService): Promise<Author> {
        const authorName = replaceMultipleSpacesAndTrim(data)
        const validateAuthorName = await this.validateAuthorName(authorName);  
        if (validateAuthorName) {
            throw new ForbiddenException(`Author with name '${name}' already exists.`);
        }
        const author = await prisma.author.create({ data: {nickname : authorName} });
        if(!author){
            throw new BadRequestException('Có lỗi trong quá trình tạo tác giả, vui lòng thử lại.');
        }
        return author
    }

    async updateAuthor(id: number, data: AuthorUpdateDto) {
        return this.prisma.author.update({
            where: { id },
            data,
        });
    }

    async delete(userId: number, authorId: number) {
        await this.roleService.checkPermission(userId, 'ManagerAuthor')
        const author = await this.findById(authorId);
        if (!author) {
            throw new NotFoundException(`Author with ID ${authorId} not found`);
        }
        return this.prisma.author.delete({
            where: { id: authorId },
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
