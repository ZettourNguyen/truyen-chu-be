import { Body, Controller, Delete, Get, Param, Post, Query, UseFilters } from '@nestjs/common';
import { RoleService } from './role.service';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { CreateUserToRole } from './dto';

@Controller('role')
@UseFilters(HttpExceptionFilter)
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
  ) { }
  @Get(':userId')
  async getPermissionOfUser(@Param('userId') userId: string) {
    return this.roleService.getPermissionOfUser(+userId);
  }

  @Get('user/:userId')
  async getUserRole(@Param('userId') userId: string) {
    return this.roleService.getRolesOfUser(+userId);
  }

  @Get('name/:roleId')
  async getNameRole(@Param('roleId') roleId: string) {
    return (await this.roleService.getRole(+roleId)).name;
  }

  @Get("all/:userId")
  async findAll(@Param('userId') userId: string) {
    return this.roleService.findAll(+userId);
  }

  @Get('permission/:userId')
  async getPermissionOfRole(
    @Param('userId') userId: string,
    @Query('roleId') roleId: string
  ) {
    const permissions = await this.roleService.getPermissionOfRole(+roleId, +userId);
    return permissions
  }

  @Post('addRole/:userId')
  async addRole(
    @Param('userId') userId: string,
    @Body() body: { roleName: string, roleDescription: string }) {
    const {roleName, roleDescription } = body;
    return this.roleService.addRole(+userId, roleName, roleDescription);
  }

  @Post('addUserToRole/:userId')
async addUserToRole(
  @Param('userId') userId: string,
  @Body() body: { userIdAdd: string; roleIdAdd: string }) {
  const { userIdAdd, roleIdAdd } = body;
  return this.roleService.addUserToRole(+userId, +userIdAdd, +roleIdAdd);
}


  @Get('addPermissionToRole/:userId')
  async addPermissionToRole(
    @Param('userId') userId: string,
    @Query('roleId') roleId: string,
    @Query('permissionId') permissionId: string
  ) {
    return this.roleService.addPermissionToRole(+roleId, +userId, +permissionId);
  }
// removeUserToRole
@Delete('removeUserToRole/:userId')
  async removeUserToRole(
    @Param('userId') userId: string,
    @Query('userIdRm') userIdRm: string,
    @Query('roleId') roleId: string
  ) {
    return this.roleService.removeUserToRole(+userId, +userIdRm, +roleId);
  }

  @Delete('removePermissionToRole/:userId')
  async removePermissionToRole(
    @Param('userId') userId: string,
    @Query('roleId') roleId: string,
    @Query('permissionId') permissionId: string
  ) {
    return this.roleService.removePermissionToRole( +userId, +roleId,+permissionId);
  }
  @Delete('removeRole/:userId')
  async removeRole(
    @Param('userId') userId: string,
    @Query('roleId') roleId: string,
  ) {
    return this.roleService.removeRole(+userId, +roleId);
  }
  // removeRole

  @Get('permission-list/:userId')
  async getAllPermission(
    @Param('userId') userId: string,
  ) {
    return this.roleService.findAllPermission(+userId);
  }
}
