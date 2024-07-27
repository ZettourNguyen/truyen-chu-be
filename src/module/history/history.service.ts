import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export class HistoryService {
    constructor(private readonly prisma: PrismaService) { }

    // Thêm hoặc cập nhật lịch sử đọc cho tiểu thuyết
    // async addOrUpdateNovelHistory(userId: number, chapterId: number): Promise<void> {
    //     // Lấy novelId từ chapterId
    //     const novelId = await this.prisma.chapter.findUnique({
    //         where: { id: chapterId },
    //         select: { novelId: true }
    //     });

    //     if (!novelId) {
    //         throw new NotFoundException('Novel not found');
    //     }

    //     const { novelId } = chapter;

    //     // Kiểm tra xem tiểu thuyết đã được đọc chưa
    //     const existingNovelHistory = await this.prisma.history.findFirst({
    //         where: {
    //             userId,
    //             novelId,
    //         },
    //     });

    //     if (existingNovelHistory) {
    //         // Nếu tiểu thuyết đã được đọc, kiểm tra và cập nhật thông tin chương
    //         await this.prisma.history.update({
    //             where: { id: existingNovelHistory.id },
    //             data: {
    //                 // Cập nhật chương mới nhất đã đọc (chapterId)
    //                 chapters: {
    //                     upsert: {
    //                         where: { chapterId_userId_novelId: { chapterId, userId, novelId } },
    //                         update: {},
    //                         create: { chapterId },
    //                     },
    //                 },
    //             },
    //         });
    //     } else {
    //         // Nếu tiểu thuyết chưa được đọc, thêm mới lịch sử đọc với chương đầu tiên
    //         await this.prisma.history.create({
    //             data: {
    //                 userId,
    //                 novelId,
    //                 chapters: {
    //                     create: { chapterId },
    //                 },
    //             },
    //         });
    //     }
    // }

    // Lấy lịch sử đọc của một người dùng
    async getUserHistory(userId: number) {
        return this.prisma.history.findMany({
            where: {
                userId,
            },
        });
    }

    // Kiểm tra xem lịch sử đọc đã tồn tại chưa
    async checkHistoryExists(userId: number, chapterId: number) {
        return this.prisma.history.findFirst({
            where: {
                userId,
                chapterId,
            },
        });
    }
}
