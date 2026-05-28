import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { MailService } from './mail.service';

@Module({
  imports: [LoggingModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
