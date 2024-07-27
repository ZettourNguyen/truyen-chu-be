import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/Prisma/prisma.service';

import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService,
  ) { }
  async getDataUserById(id: number) {
    try {
      return await this.prisma.user.findUnique({
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          birthday: true,
          gender: true,
          blacklist: true,
          confirmed: true,
          createdAt: true,
        },
        where: {
          id
        }
      })
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  // kiem tra confimed cua user
  // kiem tra confirmed cua user
  async validateUserConfirmed(id: number) {
    if (id === undefined || id === null) {
      throw new Error('ID không được xác định');
    }

    return await this.prisma.user.findUnique({
      select: {
        confirmed: true
      },
      where: {
        id: id
      }
    });
  }

  async updateImageAvatar(id : number, avatar: string){
    return await this.prisma.user.update({
      select:{
        avatar:true
      },
      where:{
        id: id
      },
      data:{
        avatar: avatar
      }
    })
  }

}