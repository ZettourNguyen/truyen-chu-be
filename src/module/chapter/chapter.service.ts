import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { Chapter, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { ChapterCreateDto } from './dto';
import { NotificationService } from '../notification/notification.service';
import { FollowService } from '../follow/follow.service';
import { FirebaseStorageService } from 'src/firebase/firebase.service';
import { randomUUID } from 'crypto';
import * as os from 'os';

@Injectable()
export class ChapterService {
    constructor(private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
        private readonly followService: FollowService,
        private readonly firebaseStorageService: FirebaseStorageService,
    ) { }

    async getChapterIndexList(novelId: number): Promise<number[]> {
        // Lấy danh sách index của các chapter của truyện có novelId
        const chapters = await this.prisma.chapter.findMany({
            where: {
                novelId
            },
            select: {
                index: true
            }
        });

        // Trích xuất mảng index từ kết quả truy vấn
        const indexList = chapters.map(chapter => chapter.index);
        return indexList;
    }


    // cái này để lấy index tạo chapter mới, nghĩa là return index chưa khởi tạo.
    // cùng lúc trong dãy index liền kề bị thiếu thì sẽ di chuyển tất cả các chương lên cho đủ
    async getNextIndexChapter(novelId: number) {
        const novel = await this.prisma.novel.findUnique({
            where: {
                id: novelId
            }
        })
        const indexList = await this.getChapterIndexList(novelId);
        if (!indexList) {
            return { novelId, novelTitle: novel.title, nextIndex: 0 }
        }
        // Sắp xếp danh sách index và tìm giá trị lớn nhất
        indexList.sort((a, b) => a - b);
        const maxIndex = Math.max(...indexList);

        // Tạo dãy số liên tiếp từ 0 đến maxIndex
        const allIndexes = new Set(indexList);
        const missingIndexes: number[] = [];

        for (let i = 0; i <= maxIndex; i++) {
            if (!allIndexes.has(i)) {
                missingIndexes.push(i);
            }
        }

        if (missingIndexes.length > 0) {
            // Nếu có số bị thiếu, giảm giá trị index hiện tại để làm cho dãy số liên tục
            await this.prisma.chapter.updateMany({
                where: {
                    AND: [
                        { novelId },
                        { index: { gte: missingIndexes[0] } }
                    ]
                },
                data: {
                    index: {
                        decrement: 1
                    }
                }
            });

            // Lấy giá trị index mới là số lớn nhất trong dãy liên tiếp
            return { novelId, novelTitle: novel.title, nextIndex: missingIndexes[0] };
        } else {
            // Nếu không có số bị thiếu, trả về index tiếp theo là maxIndex + 1
            return { novelId, novelTitle: novel.title, nextIndex: maxIndex + 1 };
        }

    }

    // Tạo một chapter mới
    async create(data: ChapterCreateDto): Promise<any> {
        const { content, novelId, ...rest } = data;
        const indexList = await this.getChapterIndexList(novelId);
        // neu chua co chapter nao
        if (indexList.length === 0) {
            rest.index = 0
        }
        else {
            // Kiểm tra xem rest.index có tồn tại trong indexList không
            const isInIndexList = indexList.includes(rest.index);
            if (isInIndexList) {
                // Tăng index cho các chapter có index lớn hơn rest.index
                await this.prisma.chapter.updateMany({
                    where: {
                        AND: [
                            { novelId },
                            { index: { gte: rest.index } }
                        ]
                    },
                    data: {
                        index: {
                            increment: 1
                        }
                    }
                });
            } else {
                const maxIndex = Math.max(...indexList);
                rest.index = maxIndex + 1;
            }
        }

        //Mã hóa content

        //Mã hóa content
        // Tạo file tạm thời với nội dung từ content
        const tempFileName = `chapter_${randomUUID()}.txt`;
        const tempFilePath = path.join(os.tmpdir(), tempFileName);
        fs.writeFileSync(tempFilePath, content);

        // Tạo thư mục trên Firebase Storage
        const firebaseFolderPath = `Truyen/${novelId}/${rest.index}`;
        const firebaseFilePath = `${firebaseFolderPath}/${tempFileName}`;

        // Upload file lên Firebase Storage
        const firebaseFileUrl = await this.firebaseStorageService.uploadFile(tempFilePath, firebaseFilePath);

        // Xóa file tạm thời
        fs.unlinkSync(tempFilePath);

        // Tạo chương mới trong cơ sở dữ liệu với URL của file trên Firebase Storage
        const chapter = await this.prisma.chapter.create({
            data: {
                ...rest,
                novelId,
                content: firebaseFileUrl,
            },
        });

        const userIds = await this.followService.getAllUsersFollowingNovel(chapter.novelId);

        // Tạo thông báo
        const novelName = await this.prisma.novel.findUnique({
            where: { id: novelId },
            select: { title: true },
        });

        const dataAddNotification = {
            title: "Truyện bạn đang theo dõi đã có chương mới",
            type: "unseen",
            content: `Truyện <strong>${novelName.title}</strong> đã có chương mới`,
            userIds: userIds.map(userId => userId.userId),
        };
        await this.notificationService.createManyNotification(dataAddNotification);

        return chapter;
    }

    // Phục vụ việc đọc truyện
    async getChapterContent(id: number) {
        // Tìm chapter trong cơ sở dữ liệu bằng id
        const chapter = await this.prisma.chapter.findUnique({
            where: { id, isPublish: true },
        });

        // Nếu không tìm thấy chapter, throw NotFoundException
        if (!chapter) {
            throw new NotFoundException(`Chapter with id ${id} not found`);
        }
        const novel = await this.prisma.novel.findUnique({
            where: {
                id: chapter.novelId
            }
        })

        // // Đường dẫn tới file .txt của chapter
        // const dirPath = path.join('C:', 'uploads', chapter.novelId.toString());
        // const finalFilePath = path.join(dirPath, `chapter_${chapter.id}.txt`);
        // // Đọc nội dung từ file .txt
        // const fileContent = fs.readFileSync(finalFilePath, 'utf-8');
        // chapter.content = fileContent;

        // Tìm chỉ số của chapter hiện tại
        const currentIndex = chapter.index;

        // Tìm preIndex và nextIndex
        const previousChapter = await this.prisma.chapter.findFirst({
            where: {
                novelId: chapter.novelId,
                index: { lt: currentIndex },
            },
            orderBy: { index: 'desc' },
        });

        const nextChapter = await this.prisma.chapter.findFirst({
            where: {
                novelId: chapter.novelId,
                index: { gt: currentIndex },
            },
            orderBy: { index: 'asc' },
        });

        // Gắn preIndex và nextIndex vào chapter
        const chapterWithIndexes = {
            ...chapter,
            novelTitle: novel.title,
            preIndex: previousChapter ? previousChapter.id : null,
            nextIndex: nextChapter ? nextChapter.id : null,
        };

        return chapterWithIndexes;
    }


    async findIdChapterIndexZeroOfNovel(novelId) {
        const chapter = await this.prisma.chapter.findFirst({
            where: {
                novelId,
                index: 0
            },
        })
        // if (!chapter) {
        //     throw new NotFoundException(`no chapter index 0 of novelId ${novelId}`)
        // }
        return chapter
    }

    async countChaptersPublishedInLast7Days(novelId: number): Promise<number> {
        // Lấy ngày hiện tại
        const currentDate = new Date();
        // Lấy ngày 7 ngày trước
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(currentDate.getDate() - 7);


        const chaptersPublishedInLast7Days = await this.prisma.chapter.count({
            where: {
                novelId,
                createdAt: {
                    gte: sevenDaysAgo,  // greater than or equal to 7 days ago
                    lt: currentDate,    // less than current date
                },
            },
        });

        return chaptersPublishedInLast7Days;
    }

    async findAll(): Promise<Chapter[]> {
        return this.prisma.chapter.findMany();
    }

    // list chapters
    async findAllChaptersOfNovel(novelId: number, publishedOnly: boolean) {
        // Lấy danh sách các chương từ cơ sở dữ liệu
        const chapters = await this.prisma.chapter.findMany({
            where: {
                novelId,
                ...(publishedOnly ? { isPublish: true } : {}), // Nếu publishedOnly là true, lọc các chương đã xuất bản
            },
            select: {
                id: true,
                title: true,
                novelId: true,
                createdAt: true,
                updatedAt: true,
                index: true,
                isPublish: true,
                chapterLength: true,
                _count: {
                    select: { View: true } // Tính số lượng lượt xem
                }
            },
            orderBy: {
                index: 'asc', // Sắp xếp theo chỉ số tăng dần
            },
        });

        // Kiểm tra nếu không có chương nào được tìm thấy
        if (!chapters || chapters.length === 0) {
            throw new NotFoundException(`Không có chapter nào của truyện ${novelId}`);
        }

        const chaptersWithViewCount = chapters.map(chapter => ({
            ...chapter,
            views: chapter._count.View // Tính số lượng lượt xem
        }));
        const result = chaptersWithViewCount.map(({ _count, ...rest }) => rest);
        return result;
    }

    async update(id: number, data: Prisma.ChapterUpdateInput): Promise<Chapter> {
        return this.prisma.chapter.update({
            where: { id },
            data,
        });
    }

    async updateIsPublish(id: number, data: Prisma.ChapterUpdateInput): Promise<Chapter> {
        return this.prisma.chapter.update({
            where: { id },
            data: {
                ...data,
                createdAt: new Date(), // Update `createdAt` to current time
            },
        });
    }

    // them status cho chapter, xoa lan 1 = đưa vào thùng rác, xóa lần 2 là xóa vĩnh viễn.
    // thùng rác: sau khoảng 1 thời gian thì server tự động xóa


    async remove(id: number): Promise<Chapter> {
        return this.prisma.chapter.delete({
            where: { id },
        });
    }
}
