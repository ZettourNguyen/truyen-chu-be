import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateReport } from './dto';
import { RoleService } from '../role/role.service';

@Injectable()
export class ReportService {
    constructor(private readonly prisma: PrismaService,
        private readonly roleService: RoleService
    ) { }

    // Phương thức để tạo một báo cáo mới
    async createReport(data: CreateReport) {
        const report = await this.prisma.report.create({
            data: {
                ...data,
                type: "pending"  //and processed
            },
        });
        return report
    }

    async getReports() {
        const reports = await this.prisma.report.findMany({
            include: {
                user: true,
                novel: true,
                comment: true,
            },
            orderBy:{
                createdAt:"desc"
            }
        });
        const result = Promise.all(reports.map((report) => {
            return {
                id: report.id,
                title: report.title,
                content: report.content,
                type: report.type,
                createdAt: report.createdAt,
                userId: report.userId,
                username: report.user.username,
                novelId: report.novelId,
                novelTitle:report.novel.title,
                commentId: report.commentId,
                commentContent: report?.comment?.content
            }
        }))
        return result
    }

    async updateReport(userId, reportId) {
        // check permission userId
        await this.roleService.checkPermission(userId, "Report")
        // update type report da qua xu li
        await this.prisma.report.update({
            where: {
                id: reportId
            },
            data: { type: "processed" }
        })
    }

}
