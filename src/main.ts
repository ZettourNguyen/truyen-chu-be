import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { PrismaService } from './Prisma/prisma.service';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.enableCors();
  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
}
bootstrap();
