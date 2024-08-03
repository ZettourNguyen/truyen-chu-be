import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { RatingCreateDto, RatingVoteDto } from './dto';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) { }

  async createRating(ratingDto: RatingCreateDto) {
    // Kiểm tra xem đã có đánh giá của người dùng cho truyện này chưa
    const existingRating = await this.prisma.rating.findFirst({
      where: {
        userId: ratingDto.userId,
        novelId: ratingDto.novelId
      }
    });
  
    if (existingRating) {
      // Nếu đã có, cập nhật đánh giá đó
      return this.prisma.rating.update({
        where: {
          id: existingRating.id
        },
        data: {
          ...ratingDto,
          updatedAt: new Date() // Cập nhật thời gian sửa đổi
        }
      });
    } else {
      // Nếu chưa có, tạo mới một đánh giá
      return this.prisma.rating.create({
        data: {
          ...ratingDto
        }
      });
    }
  }
  
  async createVoteRating(ratingDto: RatingVoteDto) {
    const existing = await this.prisma.rating_interaction.findUnique({
      where: {
        ratingId_userId: {
          ratingId: ratingDto.ratingId,
          userId: ratingDto.userId
        }
      }
    })

    if (existing) {
      const update = await this.prisma.rating_interaction.update({
        where: {
          ratingId_userId: {
            ratingId: ratingDto.ratingId,
            userId: ratingDto.userId
          }
        },
        data: {
          interactionType: ratingDto.interactionType,
        },
      });
      return true
    } else {
      const create = await this.prisma.rating_interaction.create({
        data: {
          ...ratingDto,
        },
      });
      return true
    }


  }

  async getAverageRating(novelId: number) {
    const ratings = await this.prisma.rating.findMany({
      where: { novelId },
      select: { rating: true },
    });

    const totalRating = ratings.reduce((sum, { rating }) => sum + rating, 0);
    return totalRating / ratings.length;
  }

  async getAllRatingInNovel(novelId: number) {
    const ratings = await this.prisma.rating.findMany({
      where: { novelId },
      include: {
        user: true,
      }
    });
  
    const ratingDetails = await Promise.all(ratings.map(async (rating) => {
      const rating_vote = await this.prisma.rating_interaction.findMany({
        where: {
          ratingId: rating.id
        }
      });
  
      // Có 2 kiểu interaction: up và down.
      const result_vote = rating_vote.reduce((total, vote) => {
        if (vote.interactionType === 'up') {
          return total + 1; // Cộng 1 cho mỗi lượt vote 'up'
        } else if (vote.interactionType === 'down') {
          return total - 1; // Trừ 1 cho mỗi lượt vote 'down'
        }
        return total; // Nếu không phải 'up' hoặc 'down', không thay đổi điểm
      }, 0);
  
      const type_vote = await this.prisma.rating_interaction.findUnique({
        where: {
          ratingId_userId: {
            ratingId: rating.id,
            userId: rating.userId
          }
        }
      });
  
      return {
        id: rating.id,
        userId: rating.userId,
        ratingContent: rating.content,
        ratingPoint: rating.rating,
        novelId: rating.novelId,
        updatedAt: rating.updatedAt.toISOString(),
        username: rating.user.username,
        userAvatar: rating.user.avatar,
        rating_vote: result_vote,
        type_vote: type_vote ? type_vote.interactionType : null // Kiểm tra giá trị type_vote
      };
    }));
  
    return ratingDetails;
  }
  
}

