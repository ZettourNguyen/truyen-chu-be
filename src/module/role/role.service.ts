import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateUserToRole } from './dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class RoleService {
    constructor(private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService
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
    async getPermissionOfRole(roleId: number, userId?: number) {
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

                return { ...role, permissions }
            })
        );
        return rolesAndPermissions
    }


    async checkPermission(userId: number, permissionName: string) {
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

    async addRole(userId: number, roleName: string, roleDescription: string) {
        await this.checkPermission(userId, "Role")
        const checkNameRoleExisting = await this.prisma.role.findFirst({
            where: {
                name: roleName
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

    async addUserToRole(userId: number, userIdAdd: number, roleIdAdd: number) {
        await this.checkPermission(userId, "Role")

        const result = await this.prisma.userToRole.create({
            data: {
                userId: userIdAdd,
                roleId: roleIdAdd
            }
        })

        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        })
        const permissions = await this.getPermissionOfRole(roleIdAdd)

        const notificationPromises = permissions.map(async (permission) => {
            const permissionName = permission.name;
            console.log(permissionName)
            // Xác định tiêu đề và nội dung thông báo dựa trên quyền
            let title = "";
            let content = ``;
            if (permissionName.includes('Manager')) {
                title = "Bạn có thể sử dụng quyền quản lý";
                content = `Bạn đã được thêm vai trò ${permissionName} bởi ${user.username}`;
            }
            switch (permissionName) {
                case "NoComment":
                    title = "Bạn đã bị cấm bình luận";
                    content = `Bạn đã bị cấm bình luận bởi ${user.username}. Nếu không hiểu vì sao, xin liên hệ với quản trị viên`;
                    break;
                case "NoPost":
                    title = "Bạn đã bị cấm đăng truyện";
                    content = `Bạn đã bị cấm đăng truyện bởi ${user.username}. Nếu không hiểu vì sao, xin liên hệ với quản trị viên`;
                    break;
                case "NoReview":
                    title = "Bạn đã bị cấm đánh giá";
                    content = `Bạn đã bị cấm đánh giá bởi ${user.username}. Nếu không hiểu vì sao, xin liên hệ với quản trị viên`;
                    break;
                case "NoReport":
                    title = "Bạn đã bị cấm báo cáo";
                    content = `Bạn đã bị cấm báo cáo bởi ${user.username}. Nếu không hiểu vì sao, xin liên hệ với quản trị viên`;
                    break;
                default:
                    // Nếu quyền không được xác định, sử dụng tiêu đề và nội dung mặc định
                    break;
            }

            // Tạo đối tượng thông báo
            const dataAddNotification = {
                title,
                type: "unseen",
                content,
                userId: userIdAdd,
            };
            // Gửi thông báo
            if (dataAddNotification.title !== "") {
                await this.notificationService.addNotification(dataAddNotification);
            }
        });

        // Chờ tất cả các thông báo được gửi
        await Promise.all(notificationPromises);


        return result

    }

    async addPermissionToRole(roleId: number, userId: number, permissionId: number) {
        await this.checkPermission(userId, "Role")

        const result = await this.prisma.roleToPermission.create({
            data: {
                roleId, permissionId
            }
        })
        return result
    }
    // removeUserToRole
    async removeUserToRole(userId: number, userIdRm: number, roleId: number) {
        await this.checkPermission(userId, "Role")
        console.log(roleId)
        const result = await this.prisma.userToRole.delete({
            where: {
                userId_roleId: {
                    userId: userIdRm,
                    roleId
                }
            }
        })
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        })
        const permissions = await this.getPermissionOfRole(roleId)
        const notificationPromises = permissions.map(async (permission) => {
            const permissionName = permission.name;
            console.log(permissionName)
            // Xác định tiêu đề và nội dung thông báo dựa trên quyền
            let title = "";
            let content = ``;
            if (permissionName.includes('Manager')) {
                title = "Bạn đã bị mất quyền quản lý";
                content = `Bạn đã loại bỏ vai trò ${permissionName} bởi ${user.username}`;
            }
            switch (permissionName) {
                case "NoComment":
                    title = "Bạn đã có thể bình luận";
                    content = `Bạn đã có thể bình luận bởi ${user.username}`;
                    break;
                case "NoPost":
                    title = "Bạn đã có thể đăng truyện";
                    content = `Bạn đã có thể đăng truyện bởi ${user.username}`;
                    break;
                case "NoReview":
                    title = "Bạn đã có thể đánh giá";
                    content = `Bạn đã có thể đánh giá bởi ${user.username}`;
                    break;
                case "NoReport":
                    title = "Bạn đã có thể báo cáo";
                    content = `Bạn đã có thể báo cáo bởi ${user.username}`;
                    break;

                default:
                    // Nếu quyền không được xác định, sử dụng tiêu đề và nội dung mặc định
                    break;
            }

            // Tạo đối tượng thông báo
            const dataAddNotification = {
                title,
                type: "unseen",
                content,
                userId: userIdRm,
            };
            // Gửi thông báo
            if (dataAddNotification.title !== "") {
                await this.notificationService.addNotification(dataAddNotification);
            }
        });

        // Chờ tất cả các thông báo được gửi
        await Promise.all(notificationPromises);
        return result
    }

    async removePermissionToRole(userId: number, roleId: number, permissionId: number) {
        await this.checkPermission(userId, "Role")

        const result = await this.prisma.roleToPermission.delete({
            where: {
                roleId_permissionId: {
                    roleId, permissionId
                }
            }
        })
        return result
    }

    async removeRole(userId: number, roleId: number) {
        await this.checkPermission(userId, "Role")


        const numberOfPermission = await this.prisma.roleToPermission.count({
            where:{
                roleId
            }
        })
        console.log(numberOfPermission)
        if (numberOfPermission>0) {
            throw new BadRequestException('Hãy xóa tất cả quyền trước khi xóa Vai trò')
        }
        await this.prisma.userToRole.deleteMany({
            where: {
                roleId
            }
        })
        const deleteRole = await this.prisma.role.delete({
            where: {
                id: roleId
            }
        })

        return deleteRole
    }

    async findAllPermission(userId) {
        await this.checkPermission(userId, "Role")

        return await this.prisma.permission.findMany({
            orderBy: { name: "asc" }
        })

    }
}
