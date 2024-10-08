import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateNovel } from './dto/create.novel.dto';
import { UpdateNovelDTO } from './dto/update.novel.dto';
import { UserService } from '../auth/user.service';
import { MailSenderEmailVerify } from '../auth/helper/mailSender';
import { generateVerificationCode } from '../auth/helper/verificationCode';
import { redisClient } from 'src/redis/connect';
import { KeyGenerator } from '../auth/helper/key';
import { AuthorService } from '../author/author.service';
import { formatString, replaceMultipleSpacesAndTrim } from 'src/utils/word';
import { TagService } from '../tag/tag.service';
import { ChapterService } from '../chapter/chapter.service';
import { RoleService } from '../role/role.service';
import { Novel } from '@prisma/client';

@Injectable()
export class NovelService {
    constructor(private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly authorService: AuthorService,
        private readonly tagService: TagService,
        private readonly chapterService: ChapterService,
        private readonly roleService: RoleService,
    ) { }

    async findNovelByKeyWord(keyword: string) {
        const novels = await this.prisma.novel.findMany({
            where: {
                title: {
                    contains: keyword,
                }
            },
            include: {
                chapters: {
                    include: {
                        View: true // Bao gồm lượt xem của các chương
                    }
                },
                authors: {
                    include: {
                        author: true // Lấy thông tin tác giả qua bảng liên kết
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                category: true,
                poster: true
            }
        });
        const result = novels.map(novel => {
            // Tính tổng số lượt xem từ các chương
            const totalViews = novel.chapters.reduce((acc, chapter) => acc + chapter.View.length, 0);
            // Lấy danh sách tên tác giả và ID tác giả
            const authorNames = novel.authors.map(novelAuthor => novelAuthor.author.nickname).join(', ');
            const authorIds = novel.authors.map(novelAuthor => novelAuthor.author.id).join(', ');
            // Trả về dữ liệu theo định dạng yêu cầu
            return {
                id: novel.id,
                title: novel.title,
                image: novel.image,
                description: novel.description,
                categoryId: novel.categoryId,
                categoryName: novel.category.name,
                posterId: novel.posterId,
                posterName: novel.poster.username,
                tags: novel.tags.map(tag => tag.tag),
                author: novel.authors.map(author => author.author),
                createdAt: novel.createdAt.toISOString(),
                views: totalViews
            };
        });
        return result
    }

    async get10Novel() {
        const novels = await this.prisma.novel.findMany({
            take: 20,
            orderBy: { createdAt: 'asc' }, // Chỉnh lại thứ tự nếu cần
            include: {
                chapters: {
                    include: {
                        View: true // Bao gồm lượt xem của các chương
                    }
                },
                authors: {
                    include: {
                        author: true // Lấy thông tin tác giả qua bảng liên kết
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                category: true,
                poster: true
            }
        });

        const novelsWithViews = novels.map(novel => {
            const totalViews = novel.chapters.reduce((acc, chapter) => acc + chapter.View.length, 0);
            return {
                id: novel.id,
                title: novel.title,
                image: novel.image,
                description: novel.description,
                categoryId: novel.categoryId,
                categoryName: novel.category.name,
                posterId: novel.posterId,
                posterName: novel.poster.username,
                tags: novel.tags.map(tags => tags.tag),
                author: novel.authors.map(novelAuthor => novelAuthor.author),
                createdAt: novel.createdAt.toISOString(),
                views: totalViews
            };
        });

        return novelsWithViews;
    }

    async getNovelLast() {
        // Lấy tất cả các truyện kèm các chương và thông tin tác giả
        const novels = await this.prisma.novel.findMany({
            take: 20,
            where: {
                state: {
                    notIn: ['unpublished', 'deleted', 'pending']  // notIn: ["deleted", "unpublish"] 
                }
            },
            include: {
                chapters: {
                    include: {
                        View: true
                    },
                    where: {
                        isPublish: true
                    }
                },
                authors: {
                    include: {
                        author: true
                    }
                },
            }
        });

        // Tính toán và sắp xếp các truyện
        const novelsWithViews = novels.map(novel => {
            // Tính tổng số lượt xem từ tất cả các chương
            const totalViews = novel.chapters.reduce((acc, chapter) => acc + chapter.View.length, 0);

            // Lấy thời điểm của chương mới nhất
            const listTime = novel.chapters.map(chapter => {
                const time = new Date(chapter.createdAt).getTime();
                return isNaN(time) ? 0 : time; // Xử lý trường hợp ngày giờ không hợp lệ
            });
            const lastTime = Math.max(...listTime);
            const lastChapterCreatedAt = new Date(lastTime).toISOString();

            return {
                id: novel.id,
                title: novel.title,
                image: novel.image,
                author: novel.authors.map(novelAuthor => novelAuthor.author),
                lastChapterCreatedAt: lastChapterCreatedAt,
                views: totalViews
            };
        });

        // Sắp xếp các truyện theo thời điểm tạo chương mới nhất
        const sortedNovels = novelsWithViews.sort((a, b) => new Date(b.lastChapterCreatedAt).getTime() - new Date(a.lastChapterCreatedAt).getTime());

        return sortedNovels;
    }



    // thuật toán xáo trộn ở đây dùng cho việc lấy ngẫu nhiên truyện 
    private shuffleArray(array: number[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async findNovelsByAuthor(id: number) {
        const novels = await this.prisma.novel.findMany({
            take: 20,
            orderBy: { createdAt: 'asc' }, // Chỉnh lại thứ tự nếu cần
            where: {
                authors: {
                    some: {
                        authorId: id // Lọc theo ID tác giả
                    }
                }
            },
            include: {
                chapters: {
                    include: {
                        View: true // Bao gồm lượt xem của các chương
                    }
                },
                authors: {
                    include: {
                        author: true // Lấy thông tin tác giả qua bảng liên kết
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                category: true,
                poster: true
            }
        });

        const novelsByAuthor = novels.map(novel => {
            // Tính tổng số lượt xem từ các chương
            const totalViews = novel.chapters.reduce((acc, chapter) => acc + chapter.View.length, 0);
            // Lấy danh sách tên tác giả và ID tác giả
            const authorNames = novel.authors.map(novelAuthor => novelAuthor.author.nickname).join(', ');
            const authorIds = novel.authors.map(novelAuthor => novelAuthor.author.id).join(', ');
            // Trả về dữ liệu theo định dạng yêu cầu
            return {
                id: novel.id,
                title: novel.title,
                image: novel.image,
                description: novel.description,
                categoryId: novel.categoryId,
                categoryName: novel.category.name,
                posterId: novel.posterId,
                posterName: novel.poster.username,
                tags: novel.tags.map(tag => tag.tag),
                author: novel.authors.map(author => author.author),
                createdAt: novel.createdAt.toISOString(),
                views: totalViews
            };
        });

        return novelsByAuthor;
    }

    async findNovelsByPoster(id: number) {
        const novels = await this.prisma.novel.findMany({
            take: 20,
            orderBy: { createdAt: 'asc' }, // Chỉnh lại thứ tự nếu cần
            where: {
                posterId: id
            },
            include: {
                chapters: {
                    include: {
                        View: true // Bao gồm lượt xem của các chương
                    }
                },
                authors: {
                    include: {
                        author: true // Lấy thông tin tác giả qua bảng liên kết
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                category: true,
                poster: true
            }
        });

        const novelsByAuthor = novels.map(novel => {
            // Tính tổng số lượt xem từ các chương
            const totalViews = novel.chapters.reduce((acc, chapter) => acc + chapter.View.length, 0);
            // Lấy danh sách tên tác giả và ID tác giả
            const authorNames = novel.authors.map(novelAuthor => novelAuthor.author.nickname).join(', ');
            const authorIds = novel.authors.map(novelAuthor => novelAuthor.author.id).join(', ');
            // Trả về dữ liệu theo định dạng yêu cầu
            return {
                id: novel.id,
                title: novel.title,
                image: novel.image,
                description: novel.description,
                categoryId: novel.categoryId,
                categoryName: novel.category.name,
                posterId: novel.posterId,
                posterName: novel.poster.username,
                tags: novel.tags.map(tag => tag.tag),
                author: novel.authors.map(author => author.author),
                createdAt: novel.createdAt.toISOString(),
                views: totalViews
            };
        });

        return novelsByAuthor;
    }
    async findNovelsByCategory(id: number) {
        const novels = await this.prisma.novel.findMany({
            take: 20,
            orderBy: { createdAt: 'asc' }, // Chỉnh lại thứ tự nếu cần
            where: {
                categoryId: id
            },
            include: {
                chapters: {
                    include: {
                        View: true // Bao gồm lượt xem của các chương
                    }
                },
                authors: {
                    include: {
                        author: true // Lấy thông tin tác giả qua bảng liên kết
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                category: true,
                poster: true
            }
        });

        const novelsByAuthor = novels.map(novel => {
            // Tính tổng số lượt xem từ các chương
            const totalViews = novel.chapters.reduce((acc, chapter) => acc + chapter.View.length, 0);
            // Lấy danh sách tên tác giả và ID tác giả
            const authorNames = novel.authors.map(novelAuthor => novelAuthor.author.nickname).join(', ');
            const authorIds = novel.authors.map(novelAuthor => novelAuthor.author.id).join(', ');
            // Trả về dữ liệu theo định dạng yêu cầu
            return {
                id: novel.id,
                title: novel.title,
                image: novel.image,
                description: novel.description,
                categoryId: novel.categoryId,
                categoryName: novel.category.name,
                posterId: novel.posterId,
                posterName: novel.poster.username,
                tags: novel.tags.map(tag => tag.tag),
                author: novel.authors.map(author => author.author),
                createdAt: novel.createdAt.toISOString(),
                views: totalViews
            };
        });

        return novelsByAuthor;
    }
    async findNovelsByTag(id: number) {
        const novels = await this.prisma.novel.findMany({
            take: 20,
            orderBy: { createdAt: 'asc' }, // Chỉnh lại thứ tự nếu cần
            where: {
                tags: {
                    some: {
                        tagId: id
                    }
                }
            },
            include: {
                chapters: {
                    include: {
                        View: true // Bao gồm lượt xem của các chương
                    }
                },
                authors: {
                    include: {
                        author: true // Lấy thông tin tác giả qua bảng liên kết
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                category: true,
                poster: true
            }
        });

        const novelsByAuthor = novels.map(novel => {
            // Tính tổng số lượt xem từ các chương
            const totalViews = novel.chapters.reduce((acc, chapter) => acc + chapter.View.length, 0);
            // Lấy danh sách tên tác giả và ID tác giả
            const authorNames = novel.authors.map(novelAuthor => novelAuthor.author.nickname).join(', ');
            const authorIds = novel.authors.map(novelAuthor => novelAuthor.author.id).join(', ');
            // Trả về dữ liệu theo định dạng yêu cầu
            return {
                id: novel.id,
                title: novel.title,
                image: novel.image,
                description: novel.description,
                categoryId: novel.categoryId,
                categoryName: novel.category.name,
                posterId: novel.posterId,
                posterName: novel.poster.username,
                tags: novel.tags.map(tag => tag.tag),
                author: novel.authors.map(author => author.author),
                createdAt: novel.createdAt.toISOString(),
                views: totalViews
            };
        });

        return novelsByAuthor;
    }

    async findNovelsByMe(id: number) {
        const novels = await this.prisma.novel.findMany({
            select: {
                id: true,
                state: true,
                title: true,
                createdAt: true,
                updatedAt: true
            },
            where: {
                posterId: id
            }
        });


        const result = await Promise.all(novels.map(async (novel) => ({
            id: novel.id,
            title: novel.title,
            state: novel.state,
            createdAt: new Date(novel.createdAt).toLocaleString(),
            updatedAt: new Date(novel.updatedAt).toLocaleString(),
            chapters: await this.countChapterInNovel(novel.id), // Đếm số lượng chương
        })));

        return result
    }

    async countChapterInNovel(id): Promise<number> {
        const result = await this.prisma.chapter.count({
            where: {
                novelId: id
            }
        })
        return result
    }
    async getRandomBanners() {
        // Lấy tất cả các bản ghi có trường `banner` không phải là null
        const allNovels = await this.prisma.novel.findMany({
            where: {
                banner: {
                    not: null,
                },
            },
        });

        // Trộn danh sách và lấy 3 bản ghi ngẫu nhiên
        const shuffledNovels = allNovels.sort(() => 0.5 - Math.random());
        const randomNovels = shuffledNovels.slice(0, 3);

        return randomNovels;
    }
    async getNovelsByRandom() {
        const totalNovels = await this.prisma.novel.count();
        const count = 6; // Số lượng tiểu thuyết cần lấy

        if (totalNovels < count) {
            throw new BadRequestException('Không đủ novel cho random');
        }

        const novelIds = (await this.prisma.novel.findMany({
            select: { id: true }, where: { state: { notIn: ["deleted", "unpublished", "pending"] } }
        })).map(novel => novel.id);
        const shuffledIds = this.shuffleArray(novelIds).slice(0, count);

        const novels = await this.prisma.novel.findMany({
            where: {
                id: { in: shuffledIds },
            },
            select: {
                id: true,
                title: true,
                image: true,
                state: true,
                description: true,
                posterId: true,
                categoryId: true,
                authors: {
                    select: {
                        author: true
                    }
                }
            },

        });
        const result = await Promise.all(novels.map(async (novel) => ({
            id: novel.id,
            title: novel.title,
            image: novel.image,
            state: novel.state,
            description: novel.description,
            categoryId: novel.categoryId,
            categoryName: await this.getCategoryName(novel.categoryId),
            posterId: novel.posterId,
            posterName: (await this.userService.getDataUserById(novel.posterId)).username,
            posterAvatar: (await this.userService.getDataUserById(novel.posterId)).avatar,
            author: novel.authors.map(novelAuthor => novelAuthor.author)
        })));
        return result;
    }

    async getNovelsByMostLiked() {
        const novels = await this.prisma.novel.findMany({
            take: 6,
            where: {
                state: {
                    notIn: ['deleted', 'unpublished', 'pending']
                }
            },
            select: {
                id: true,
                title: true,
                image: true,
                state: true,
                description: true,
                posterId: true,
                categoryId: true,
                authors: {
                    select: {
                        author: true
                    }
                }
            },
            orderBy: {
                followers: {
                    _count: 'desc'
                }
            }

        });
        const result = await Promise.all(novels.map(async (novel) => ({
            id: novel.id,
            title: novel.title,
            image: novel.image,
            state: novel.state,
            description: novel.description,
            categoryId: novel.categoryId,
            categoryName: await this.getCategoryName(novel.categoryId),
            posterId: novel.posterId,
            posterName: (await this.userService.getDataUserById(novel.posterId)).username,
            posterAvatar: (await this.userService.getDataUserById(novel.posterId)).avatar,
            author: novel.authors.map(novelAuthor => novelAuthor.author)
        })));
        return result;
    }
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

    async findOneNovelByName(title: string) {
        try {
            const novel = await this.prisma.novel.findFirst({
                where: {
                    title: title
                }
            });
            return novel;
        } catch (error) {
            throw new BadRequestException(error)
        }

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
        const novelTitle = replaceMultipleSpacesAndTrim(formatString(data.title.trim()))
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
        const novels = await this.prisma.novel.findMany({
            include: {
                poster: {
                    select: {
                        id: true,
                        username: true
                    }
                },
            }
        });

        const result = await Promise.all(novels.map(async (novel) => {
            const chapterCount = await this.countChapterInNovel(novel.id)
            return {
                id: novel.id,
                title: novel.title,
                state: novel.state,
                createdAt: novel.createdAt,
                updatedAt: novel.updatedAt,
                chapters: chapterCount,
                posterId: novel.poster.id,
                posterName: novel.poster.username
            }
        }))
        return result;
    }

    async findNovelById(id: number) {
        const novel = await this.prisma.novel.findUnique({
            where: {
                id: id,
            },
            include: {
                chapters: {
                    select: {
                        _count: {
                            select: { View: true } // Tính số lượng lượt xem
                        }
                    }
                },
                bookmarks: true,
                ratings: true
            }
        });
        if (!novel) {
            throw new NotFoundException(`Novel with ID ${id} not found`);
        }
        return novel;
    }

    async getNovelPageById(id: number) {
        const novel = await this.findNovelById(id)

        const [author, categoryName, poster,
            chapter, countChaptersPublishedInLast7Days, tags,] = await Promise.all([
                this.authorService.findAuthorByNovelId(novel.id),
                this.getCategoryName(novel.categoryId),
                this.userService.getDataUserById(novel.posterId),
                this.chapterService.findIdChapterIndexZeroOfNovel(novel.id),
                this.chapterService.countChaptersPublishedInLast7Days(novel.id),
                this.tagService.getTagByNovelId(novel.id)
            ]);


        const totalView = novel.chapters.reduce((total, chapter) => {
            // Kiểm tra và đảm bảo chapter.View là số
            const viewCount = chapter._count.View;
            return total + viewCount;
        }, 0);
        const totalBookmarks = novel.bookmarks.length;
        const totalRatings = novel.ratings.length;
        const result = {
            id: novel.id,
            title: novel.title,
            image: novel.image,
            state: novel.state,
            description: novel.description,
            categoryId: novel.categoryId,
            categoryName,
            author,
            posterId: novel.posterId,
            posterName: poster.username,
            posterAvatar: poster.avatar,
            createdAt: novel.createdAt,
            updatedAt: novel.updatedAt,
            chapter0: chapter.id,
            countChaptersPublishedInLast7Days,
            views: totalView,
            numberOfNominations: totalRatings,
            numberSavedBookmark: totalBookmarks,
            tags

        };
        return result;
    }

    async updateNovelImageCover(novelId: number, image: string) {
        await this.findNovelById(novelId)

        const novel = await this.prisma.novel.update({
            where: {
                id: novelId,
            },
            data: {
                image
            },
        });
        return novel;
    }

    async updateNovel(id: number, data: UpdateNovelDTO) {
        const novel = await this.prisma.novel.findUnique({ where: { id } });
        if (!novel) {
            throw new NotFoundException(`Novel with id ${id} not found`);
        }
        const { tagsId, ...dataUpdate } = data
        const result = await this.prisma.novel.update({
            where: {
                id,
                posterId: data.posterId
            },
            data: dataUpdate,
        });

        // update novelTag
        if (tagsId) {
            // Xoá các tag hiện tại
            await this.prisma.novelTag.deleteMany({
                where: {
                    novelId: id,
                },
            });
            // Thêm các tag mới
            const novelTags = tagsId.map(tagId => ({
                novelId: id,
                tagId,
            }));

            await this.prisma.novelTag.createMany({
                data: novelTags,
            });
        }

        return result;
    }

    async updateStateNovel(id: number, state: string) {
        const validStates = ["ongoing", "completed", "paused", "deleted", "unpublished", "pending"];
        if (!validStates.includes(state)) {
            throw new BadRequestException(`Invalid state value: ${state}`);
        }

        const novel = await this.prisma.novel.findUnique({ where: { id } });
        if (!novel) {
            throw new NotFoundException(`Novel with id ${id} not found`);
        }
        await this.prisma.novel.update({
            where: {
                id
            },
            data: {
                state: state
            }
        })
        return { message: `Novel with id ${id} has been changed state` };

    }

    async deleteNovel(id: number, userId: number) {
        await this.roleService.checkPermission(userId, "Novel")
        // Kiểm tra xem tiểu thuyết có tồn tại không
        const novel = await this.prisma.novel.findUnique({ where: { id, state: "deleted" } });
        if (!novel) {
            throw new NotFoundException(`Novel with id ${id} not found`);
        }

        // Xoa cac chapter
        await this.prisma.chapter.deleteMany({
            where: {
                novelId: id
            }
        })
        // Xoá các liên kết author, tag liên quan 
        await this.prisma.novelAuthor.deleteMany({
            where: {
                novelId: id,
            },
        });
        await this.prisma.novelTag.deleteMany({
            where: {
                novelId: id,
            },
        });
        // Xoá tiểu thuyết
        await this.prisma.novel.delete({
            where: {
                id,
            },
        });

        return { message: `Novel with id ${id} has been deleted` };
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
                        authorNameInInput = replaceMultipleSpacesAndTrim(authorNameInInput)
                        author = await this.authorService.validateAuthorName(authorNameInInput)
                        if (!author) {
                            author = await this.authorService.create(authorNameInInput, prisma);
                        }
                        await this.authorService.createNovelAuthor(novel.id, author.id, prisma);
                    } else {
                        // Tạo mới author and novel-author voi author = poster
                        author = await this.authorService.validateAuthorName(dataPoster.username)
                        if (!author) {
                            author = await this.authorService.create(dataPoster.username, prisma);
                        }
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

                return result;
            } catch (error) {
                console.log(error)
                return error
            }
        }
    }

}
