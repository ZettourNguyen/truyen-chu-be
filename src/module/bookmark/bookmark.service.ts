import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export class BookmarkService {
    constructor(
        private readonly prisma: PrismaService,

    ) { }
    async checkBookmark(userId: number, novelId: number){
        const bookmark = await this.prisma.bookmark.findFirst({
            where:{
                userId,
                novelId
            }
        })
        if (!bookmark) {
            return 0
        }
        return bookmark.id || null
    }

    async addBookmark(userId: number, novelId: number) {
        const newBookmark = await this.prisma.bookmark.create({
            data:{
                userId,
                novelId
            }
        })
        return newBookmark;
    }

    async deleteBookmark(id: number) {
        // Logic xóa bookmark
        await this.prisma.bookmark.delete({
            where:{
                id
            }
        })
        return { deleted: true };
    }

    async getAllBookmarks(userId: number) {
        // Logic lấy tất cả bookmarks
        const novelsBookmask = await this.prisma.bookmark.findMany({
            where:{
                userId
            },
            include:{
                novel:{
                    include:{
                        category: true,
                        authors:{
                            include:{
                                author:true
                            }
                        },
                        poster:true                   
                     }
                }
            }
        });
        const novels = novelsBookmask.map((bookmark) => {
            return {
                id: bookmark.novelId,
                title: bookmark.novel.title,
                image: bookmark.novel.image,
                banner: bookmark.novel.banner,
                state: bookmark.novel.state,
                description: bookmark.novel.description,
                updatedAt : bookmark.novel.updatedAt,
                categoryId: bookmark.novel.category.id,
                categoryName: bookmark.novel.category.name,
                posterId: bookmark.novel.posterId ,
                posterName: bookmark.novel.poster.username,
                posterAvatar: bookmark.novel.poster.avatar,
                author: bookmark.novel.authors.map(author => author.author),
                bookmarkId : bookmark.id
            }
        })
        return novels
    }
}
