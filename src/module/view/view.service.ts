import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export class ViewService {
    constructor(private prisma: PrismaService) { }
    // 1 nguoi 1 view tren 1 chapter.
    async incrementView(userId: number, chapterId: number) {
        const viewExisting = await this.prisma.view.findFirst({
            where:{
                userId,
                chapterId
            }
        })
        if(!viewExisting){
            await this.prisma.view.create({
            data: {
                userId,
                chapterId
            }
        })
        }
        
        return true
    }

    async getTotalViews(novelId: number) {
        const novel = await this.prisma.novel.findUnique({
            where: { id: novelId },
            select: {
                chapters:{
                    select:{
                        _count: {
                            select: { View: true } // Tính số lượng lượt xem
                        }
                    }
                }
            },
        });
        const totalView = novel.chapters.reduce((total, chapter) => {
            // Kiểm tra và đảm bảo chapter.View là số
            const viewCount = chapter._count.View;
            return total + viewCount;
        }, 0);

        return totalView
    }
}
