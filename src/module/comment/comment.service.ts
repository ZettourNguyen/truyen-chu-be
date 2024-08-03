import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService
  ) { }

  async create(data: CreateCommentDto) {
    // ý tưởng? check data has idparent?, nếu có thì lấy id của comment parent
    // lấy id, userid của commentparent
    // lấy userid của comment có parentid = id commentparent
    if (data.parentId) {
      const userIdParent = await this.prisma.comment.findUnique({
        where: { id: data.parentId }, select: { userId: true }
      })

      const userIdsChild = await this.prisma.comment.findMany({
        where: {
          parentId: data.parentId
        },
        select: { userId: true }
      })

      // Lọc các userId khác với data.iduser ko thông báo cho chính mình
      const uniqueUserIds = Array.from(
        new Set(userIdsChild
          .map(comment => comment.userId) // Chọn danh sách userId từ kết quả
          .filter(userId => userId !== data.userId) // Lọc userId khác data.iduser
        )
      );

      // Đảm bảo userIds không chứa giá trị trùng lặp
      const finalUserIds = uniqueUserIds.filter((value, index, self) =>
        self.indexOf(value) === index
      );


      const novelName = await this.prisma.novel.findUnique({
        where: { id: data.novelId }, select: { title: true }
      })
      const username = await this.prisma.user.findUnique({
        where: { id: data.userId }, select: { username: true }
      })

      // đảm bảo ko thông báo cho chính mình
      if (userIdParent.userId !== data.userId) {
        const dataAddNotification1User = {
          title: "Có người phản hồi bình luận của bạn",
          type: "unseen",
          content: `<strong>${username.username}</strong> đã phản hồi bình luận của bạn 
          tại Truyện <strong>${novelName.title}</strong> `,
          userId: userIdParent.userId
        }
        await this.notificationService.addNotification(dataAddNotification1User)
      }

      const dataAddNotification = {
        title: "Có người phản hồi bình luận của bạn",
        type: "unseen",
        content: `<strong>${username.username}</strong> đã phản hồi bình luận của bạn 
        tại Truyện <strong>${novelName.title}</strong> `,
        userIds: finalUserIds
      }
      await this.notificationService.createManyNotification(dataAddNotification)
    }



    return this.prisma.comment.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.comment.findMany();
  }

  async findOne(id: number) {
    return this.prisma.comment.findUnique({
      where: { id },
    });
  }
  async findByNovel(novelId: number) {
    const commentsDetail = await this.prisma.comment.findMany({
      where: {
        novelId,
        parentId: null,
        user: {
          blacklist: false, // Lọc người dùng không bị blacklist
        },
      },
      include: {
        user: true, // Bao gồm thuộc tính user trong truy vấn
        replies: {
          include: {
            user: true, // Bao gồm thuộc tính user trong phản hồi
          }
        }
      },
      orderBy: {
        createdAt: 'desc', // Sắp xếp theo thời gian tạo bình luận
      },
    });

    // Chuyển đổi dữ liệu để loại bỏ các thuộc tính không cần thiết
    const resultJson = commentsDetail.map(commentDetail => ({
      id: commentDetail.id,
      novelId: commentDetail.novelId,
      content: commentDetail.content,
      createdAt: commentDetail.createdAt,
      userId: commentDetail.userId,
      username: commentDetail.user.username, // Đảm bảo thuộc tính user đã được bao gồm trong include
      userAvatar: commentDetail.user.avatar,
      replies: commentDetail.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        userId: reply.userId,
        username: reply.user.username,
        userAvatar: reply.user.avatar,
        replyCreatedAt: reply.createdAt,
      })),
    }));

    return resultJson;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
    });
  }

  async remove(id: number) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
