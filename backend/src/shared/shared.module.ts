import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MailService } from './mail.service';

@Module({
  providers: [PrismaService, MailService],
  exports: [PrismaService, MailService],
})
export class SharedModule {}
