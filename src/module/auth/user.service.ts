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
          username: true,
          email: true
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

}