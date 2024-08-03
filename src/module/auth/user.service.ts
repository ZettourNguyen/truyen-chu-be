import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from 'src/Prisma/prisma.service';

import { JwtService } from '@nestjs/jwt';
import { RoleService } from '../role/role.service';
import { permission } from 'process';
import { UpdateIsBlackList } from './dto/user.dto';


@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService,
    private readonly roleService: RoleService,


  ) { }
  async getAll(userId: number) {
    await this.roleService.checkPermission(userId, "User")
    const user = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        birthday: true,
        gender: true,
        blacklist: true,
        confirmed: true,
        createdAt: true,
      }
    })
    return user


  }

  async getUserName(id:number){
    const user = await this.prisma.user.findUnique({
      where: {id}
    })
    return user
  }

  async getDataUserById(id: number) {
    try {
      const roleIds = (await this.roleService.getManyRoleIdOfUserId(id)).map(roleId => roleId.roleId)

      const user = await this.prisma.user.findUnique({
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
      if (user.blacklist) {
        throw new UnauthorizedException('Bạn đã bị cấm bởi Kho truyện chữ!!!')
      }
      return { ...user, roleIds }

    } catch (error) {
      throw new NotFoundException(error)
    }
  }

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

  async updateImageAvatar(id: number, avatar: string) {
    return await this.prisma.user.update({
      select: {
        avatar: true
      },
      where: {
        id: id
      },
      data: {
        avatar: avatar
      }
    })
  }
  async changeBlackList(data: UpdateIsBlackList) {
    // check user is manageruser? manageruserrole?
    await this.roleService.checkPermission(data.userId, "User");

    // check user block is superadmin
    const isSuperAdminPermission = await this.roleService.checkPermission(data.userBlockId, "Super")
    if (isSuperAdminPermission) {
      throw new ForbiddenException('Bạn không có đủ quyền để xử lí tài khoản này')
    }
    const user = await this.prisma.user.findUnique({
      where: { id: data.userBlockId },
      select: { blacklist: true }
    });

    if (!user) {
      throw new Error('User not found');
    }
    // Đảo trạng thái blacklist
    const newBlacklistStatus = !user.blacklist;

    return await this.prisma.user.update({
      where: { id: data.userBlockId },
      data: { blacklist: newBlacklistStatus }
    });
  }


}