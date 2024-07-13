import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateNovel } from './dto/create.novel.dto';
import { UpdateNovel } from './dto/update.novel.dto';
import { UserService } from '../auth/user.service';
import { MailSenderEmailVerify } from '../auth/helper/mailSender';
import { generateVerificationCode } from '../auth/helper/verificationCode';
import { redisClient } from 'src/redis/connect';
import { KeyGenerator } from '../auth/helper/key';
import { AuthorService } from '../author/author.service';
import { formatString, replaceMultipleSpacesAndTrim } from 'src/utils/word';
import { getRandomValues } from 'crypto';
import { TagService } from '../tag/tag.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NovelService {
    constructor(private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly authorService: AuthorService,
        private readonly tagService: TagService
    ) { }

    async get10Novel() {
        const novels = await this.prisma.novel.findMany({ take: 10 })
        return novels
    }
    private shuffleArray(array: number[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    async getNovelsByRandom() {
        const totalNovels = await this.prisma.novel.count();
        const count = 6; // Số lượng tiểu thuyết cần lấy

        if (totalNovels < count) {
            throw new BadRequestException('Không đủ novel cho random');
        }

        const novelIds = (await this.prisma.novel.findMany({ select: { id: true } })).map(novel => novel.id);
        const shuffledIds = this.shuffleArray(novelIds).slice(0, count);

        const novels = await this.prisma.novel.findMany({
            where: {
                id: { in: shuffledIds },
            },
        });

        return novels;
    }

    async findManyNovelByName(title: string) { // Dùng trong việc tìm truyện
        const novels = await this.prisma.novel.findMany({
            where: {
                title: {
                    contains: title,
                    // mode: 'insensitive', // Tìm kiếm không phân biệt chữ hoa chữ thường
                },
            },
        });
        if (novels.length === 0) {
            throw new NotFoundException(`No novels found with title similar to '${title}'`);
        }
        return novels;
    }

    async findOneNovelByName(title: string) { // Dùng validation tên truyên 
        const novel = await this.prisma.novel.findFirst({
            where: {
                title
            }
        })
        return novel;
    }


    async findManyNovelsByCategoryId(id: number) {
        const novels = await this.prisma.novel.findMany({
            where: {
                categoryId: id
            }
        })
        return novels
    }

    async createNovel(data: CreateNovel, prisma: PrismaService) { // ktra ten truyen co chua, chua co => tao novel
        const novelTitle = replaceMultipleSpacesAndTrim(formatString(data.title))
        const existingNovel = await this.findOneNovelByName(novelTitle)
        if (existingNovel) {
            throw new ConflictException(`Tên truyện đã có sẵn: ${novelTitle}, vui lòng đổi tên truyện khác`)
        }
        const novel = await prisma.novel.create({
            data: data
        })

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
        await this.getNovelById(id); // Kiểm tra xem tiểu thuyết có tồn tại không
        const deletedNovel = await this.prisma.novel.delete({
            where: {
                id: id,
            },
        });
        return deletedNovel;
    }

    async createNovelWithTransaction(dataNovel: CreateNovel, authorNameInInput: string, tagsId: JSON) {
        const dataPoster = await this.userService.getDataUserById(dataNovel.posterId);
        // Kiểm tra xem người đăng đã xác nhận email chưa
        const confirmed = await this.userService.validateUserConfirmed(dataNovel.posterId);
        if (!confirmed) {
            const redisKey = KeyGenerator.createSignupOTPKey(dataPoster.email);
            const existingToken = await redisClient.get(redisKey);
            if (existingToken) {
                // Xóa token cũ trong Redis
                await redisClient.del(redisKey);
            }
            const code = generateVerificationCode();
            // Lưu mã xác nhận mới vào Redis
            await redisClient.setEx(redisKey, 900, code); // 15 phút
            // Gửi mã xác nhận mới qua email
            MailSenderEmailVerify(dataPoster.email, dataPoster.username, code);
            return { message: 'Verification email sent, please check your email to confirm.' };
        } else {

            try {
                const result = await this.prisma.$transaction(async (prisma: PrismaService) => {
                    // Tạo mới Novel
                    const novel = await this.createNovel(dataNovel, prisma); // [đã kiểm tra tên truyện]
                    // Kiểm tra và tạo tác giả
                    let author;
                    if (authorNameInInput) {
                        author = await this.authorService.create(replaceMultipleSpacesAndTrim(authorNameInInput), prisma);
                        await this.authorService.createNovelAuthor(novel.id, author.id, prisma);
                    } else {
                        // Tạo mới author and novel-author voi author = poster
                        author = await this.authorService.create(replaceMultipleSpacesAndTrim(dataPoster.username), prisma);
                        await this.authorService.createNovelAuthor(novel.id, author.id, prisma);
                    }
                    // Xử lý tags
                    const parsedTagsId = typeof tagsId === 'string' ? JSON.parse(tagsId) : tagsId;
                    const ids = Array.isArray(parsedTagsId) ? parsedTagsId : [parsedTagsId]; // Đảm bảo ids là một mảng

                    for (const id of ids) {
                        await this.tagService.createNovelTag(id, novel.id, prisma);
                    }

                    return novel;
                });
                console.log("created novel successfull")
                return result;
            } catch (error) {
                console.log(error)
                return error
            }
        }
    }

}
