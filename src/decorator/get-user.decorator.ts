// get-user.decorator.ts
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { redisClient } from 'src/redis/connect';

export const GetUser = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(" ")[1]
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }
    return req.user;
  },
);
