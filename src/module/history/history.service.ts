import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { DateTime } from 'luxon';
@Injectable()
export class HistoryService {
    constructor(private readonly prisma: PrismaService) { }

    // Thêm hoặc cập nhật lịch sử đọc cho tiểu thuyết
    async addOrUpdateNovelHistory(userId: number, chapterId: number) {
        // Lấy novelId từ chapterId
        const novelId = await this.prisma.chapter.findUnique({
            where: { id: chapterId },
            select: { novelId: true }
        });

        if (!novelId) {
            throw new NotFoundException('Truyện không có sẵn');
        }

        // Lấy lịch sử của chapter chung novel với chapterId
        const existingNovelHistory = await this.checkHistoryOfNovelExists(userId, novelId.novelId)
        const updatedAt: string = DateTime.now().setZone('Asia/Ho_Chi_Minh').toISO();

        // Cập nhật chương mới nhất đã đọc (chapterId)
        if (existingNovelHistory.length > 0) {
            const historyIdExisting = existingNovelHistory.flatMap(item =>
                item.history.map(history => history.id)
            );
            await this.prisma.history.updateMany({
                where: {
                    id: {
                        in: historyIdExisting
                    }
                },
                data: {
                    chapterId,
                    updatedAt
                }
            });
        } else {
            // Nếu tiểu thuyết chưa được đọc, thêm mới lịch sử đọc với chương đầu tiên
            await this.prisma.history.create({
                data: {
                    userId,
                    chapterId,
                    updatedAt
                },
            });
        }
        return true
    }

    // Lấy lịch sử đọc của một người dùng
    async getUserHistory(userId: number) {
        const historiesDetail = await this.prisma.history.findMany({
            where: {
                userId,
            },
            include: {
                chapter: {
                    select: {
                        title: true,
                        novel: {
                            include: {
                                authors: {
                                    include: {
                                        author: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });
        const result = historiesDetail.map(
            historieDetail => {
                return {
                    id: historieDetail.id,
                    novelId: historieDetail.chapter.novel.id,
                    novelTitle: historieDetail.chapter.novel.title,
                    novelImage: historieDetail.chapter.novel.image,
                    novelDescription: historieDetail.chapter.novel.description,
                    novelState: historieDetail.chapter.novel.state,
                    author: historieDetail.chapter.novel.authors,
                    chapterId: historieDetail.chapterId,
                    chapterTitle: historieDetail.chapter.title,
                    createdAt: historieDetail.createdAt,
                    updatedAt: historieDetail.updatedAt,
                    userId,
                }

            }
        )
        return result
    }

    async checkHistoryOfNovelExists(userId: number, novelId: number) {
        // Lấy danh sách các chương của cuốn tiểu thuyết
        const chapters = await this.prisma.chapter.findMany({
            where: {
                novelId
            },
            select: { id: true }
        });

        // Kiểm tra xem người dùng đã đọc các chương này chưa
        const historyPromises = chapters.map(async (chapter) => {
            const history = await this.prisma.history.findMany({
                where: {
                    chapterId: chapter.id,
                    userId
                }
            });
            return { chapterId: chapter.id, history }; // Trả về đối tượng với chapterId và lịch sử
        });

        // Chờ tất cả các promises hoàn thành
        const resultsHistoryPromises = await Promise.all(historyPromises);

        // Lọc ra các chương có lịch sử đọc và trả về chúng
        const result = resultsHistoryPromises.filter(({ history }) => history.length > 0);

        return result;
    }
    async deleteHistory( id: number){
        return await this.prisma.history.delete({
            where:{
                id
            }
        })

    }

}
