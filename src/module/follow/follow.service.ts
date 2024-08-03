import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { RoleService } from '../role/role.service';

@Injectable()
export class FollowService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    
    async getAllUsersFollowingNovel(novelId: number) {
        const allUsersFollowing = await this.prisma.follow.findMany({
            where: {
                novelId
            },
            select: {
                userId: true
            }
        })
        return allUsersFollowing
    }

    async checkFollow(userId: number, novelId: number) {
        const follow = await this.prisma.follow.findFirst({
            where: {
                userId,
                novelId
            }
        })
        if (!follow) {
            return 0
        }
        return follow.id || null
    }

    async addFollow(userId: number, novelId: number) {
        const newfollow = await this.prisma.follow.create({
            data: {
                userId,
                novelId
            }
        })
        return newfollow;
    }

    async deleteFollow(id: number) {
        // Logic xóa follow
        await this.prisma.follow.delete({
            where: {
                id
            }
        })
        return { deleted: true };
    }

    async getAllFollows(userId: number) {
        // Logic lấy tất cả follows
        const novelsBookmask = await this.prisma.follow.findMany({
            where: {
                userId
            },
            include: {
                novel: {
                    include: {
                        category: true,
                        authors: {
                            include: {
                                author: true
                            }
                        },
                        poster: true
                    }
                }
            }
        });
        const novels = novelsBookmask.map((follow) => {
            return {
                id: follow.novelId,
                title: follow.novel.title,
                image: follow.novel.image,
                banner: follow.novel.banner,
                state: follow.novel.state,
                description: follow.novel.description,
                updatedAt : follow.novel.updatedAt,
                categoryId: follow.novel.category.id,
                categoryName: follow.novel.category.name,
                posterId: follow.novel.posterId,
                posterName: follow.novel.poster.username,
                posterAvatar: follow.novel.poster.avatar,
                author: follow.novel.authors.map(author => author.author),
                followId: follow.id
            }
        })
        return novels
    }
}
