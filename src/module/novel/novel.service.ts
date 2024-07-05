import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateNovel } from './dto/create.novel.dto';
import { UpdateNovel } from './dto/update.novel.dto';

@Injectable()
export class NovelService {
    constructor(private readonly prisma: PrismaService,
      ) { }

    async get10Novel(){
        const novels  = await this.prisma.novel.findMany({ take: 10 })
        return novels
    }

    async novelByName(title: string) {
        const novel = await this.prisma.novel.findMany({
            where: {
                title: {
                    contains: title,
                    // mode: 'insensitive', // Tìm kiếm không phân biệt chữ hoa chữ thường
                },
            },
        });
        
        if (novel.length === 0) {
            throw new NotFoundException(`No novels found with title similar to '${title}'`);
        }

        return novel;
    }

    async createNovel(data : CreateNovel){
        const novel = await this.prisma.novel.create({
            data: data
        })
        // const 
        return novel
    }

    async getAllNovels() {
        const novels = await this.prisma.novel.findMany();
        return novels;
    }

    async getNovelById(id: number) {
        const novel = await this.prisma.novel.findUnique({
            where: {
                id: id,
            },
        });
        if (!novel) {
            throw new NotFoundException(`Novel with ID ${id} not found`);
        }
        return novel;
    }

    async updateNovel(data: UpdateNovel) {
        const novel = await this.prisma.novel.update({
            where: {
                id: data.id,
                posterId: data.posterId
            },
            data: data,
        });
        return novel;
    }

    async deleteNovel(id: number) {
        const novel = await this.getNovelById(id); // Kiểm tra xem tiểu thuyết có tồn tại không
        const deletedNovel = await this.prisma.novel.delete({
            where: {
                id: id,
            },
        });
        return deletedNovel;
    }
    
}
