import { Injectable, OnModuleInit, INestApplication, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
            // Cấu hình các tùy chọn giao dịch toàn cục
            transactionOptions: {
                //đảm bảo rằng giao dịch sẽ được thực hiện một cách hoàn toàn cô lập
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable, 
                maxWait: 5000, // thời gian tối đa chờ đợi cho giao dịch
                timeout: 10000, // thời gian tối đa để hoàn thành giao dịch
            },
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async enableShutdownHooks(app: INestApplication) {
        process.on('beforeExit', () => {
            app.close();
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    
}
