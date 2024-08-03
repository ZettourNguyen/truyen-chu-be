import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateUserToRole } from './dto';

@Injectable()
export class RoleService {
    constructor(private readonly prisma: PrismaService,
    ) { }
    async getManyRoleIdOfUserId(userId: number) {
        const roles = this.prisma.userToRole.findMany({
            where: { userId }
        })
        return roles
    }
    async getRole(id: number) {
        const role = await this.prisma.role.findUnique({
            where: { id }
        })
        return role
    }

    async getRolesOfUser(userId: number) {
        try {
            const roleIds = await this.getManyRoleIdOfUserId(userId)

            const roles = await Promise.all(
                roleIds.map(async (userToRole) => {
                    const role = await this.getRole(userToRole.roleId);
                    return role.id
                })
            );

            return roles

        } catch (error) {
            throw new NotFoundException(error)
        }
    }
    async getManyPermissionOfRole(roleId: number) {
        const permission = this.prisma.roleToPermission.findMany({
            where: { roleId }
        })
        return permission
    }

    async getPermission(id: number) {
        const permission = await this.prisma.permission.findUnique({
            where: { id }
        })
        return permission
    }
    async getPermissionOfRole(roleId: number, userId? : number) {
        if (userId) {
            await this.checkPermission(userId, "Role")
        }
        const permissionsId = await this.getManyPermissionOfRole(roleId)
        const permissions = await Promise.all(
            permissionsId.map(async (permissionToRole) => {
                const permission = await this.getPermission(permissionToRole.permissionId);
                return permission
            })
        );
        return permissions
    }

    async getPermissionOfUser(userId: number) {
        const rolesId = await this.getManyRoleIdOfUserId(userId)
        const result = await Promise.all(
            rolesId.map(async (roleId) => {
                const permision = await this.getPermissionOfRole(roleId.roleId)
                return permision
            })
        )
        return result
    }

    async findAll(userId: number) {
        await this.checkPermission(userId, "Role")
        const roles = await this.prisma.role.findMany()

        const rolesAndPermissions = await Promise.all(
            roles.map(async role => {
                const permissions = await this.getPermissionOfRole(role.id);

                return{...role, permissions}
            })
        );
        return rolesAndPermissions
    }


    async checkPermission(userId:number, permissionName: string){
        const permissions = await this.getPermissionOfUser(userId)

        const hasPermission = await Promise.all(
            permissions.map(async (permission) => {
                const result = permission.some(permission => permission.name.includes(permissionName));
                return result
            })
        );
        if (!hasPermission.includes(true)) {
            throw new ForbiddenException("Bạn không có đủ quyền để truy cập")
        }
        return true
    }
    
    async addRole(userId: number, roleName: string, roleDescription: string){
        await this.checkPermission(userId, "Role")
        const checkNameRoleExisting = await this.prisma.role.findFirst({
            where:{
                name : roleName
            }
        })
        if (checkNameRoleExisting) {
            throw new ConflictException('Vai trò đã tồn tại!')
        }
        const result = await this.prisma.role.create({
            data: {
                name: roleName,
                description: roleDescription
            }
        })
        return result
    }

    async addUserToRole(userId:number , userIdAdd : number, roleIdAdd: number){
        await this.checkPermission(userId, "Role")

        const result = await this.prisma.userToRole.create({
            data: {
                userId : userIdAdd,
                roleId : roleIdAdd
            }
        })
        return result

    }

    async addPermissionToRole(roleId: number,userId: number, permissionId: number){
        await this.checkPermission(userId, "Role")

        const result = await this.prisma.roleToPermission.create({
            data:{
                roleId, permissionId
            }
        })
        return result
    }
    // removeUserToRole
    async removeUserToRole(userId: number,userIdRm: number, roleId: number){
        await this.checkPermission(userId, "Role")

        const result = await this.prisma.userToRole.delete({
            where:{
                userId_roleId:{
                    userId:userIdRm,
                    roleId
                }
            }
        })
        return result
    }

    async removePermissionToRole(userId: number, roleId: number, permissionId: number){
        await this.checkPermission(userId, "Role")

        const result = await this.prisma.roleToPermission.delete({
            where:{
                roleId_permissionId:{
                    roleId, permissionId
                }
            }
        })
        return result
    }

    async removeRole(userId: number, roleId: number){
        await this.checkPermission(userId, "Role")


        await this.prisma.roleToPermission.deleteMany({
            where:{
                roleId
            }
        })
        await this.prisma.userToRole.deleteMany({
            where:{
                roleId
            }
        })
        const deleteRole = await this.prisma.role.delete({
            where:{
                id: roleId
            }
        })

        return deleteRole
    }

    async findAllPermission(userId){
        await this.checkPermission(userId, "Role")

        return await this.prisma.permission.findMany({
            orderBy:{name:"asc"}
        })

    }
}
