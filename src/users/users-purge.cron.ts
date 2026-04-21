import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';

@Injectable()
export class UsersPurgeCron {
  constructor(private readonly usersService: UsersService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  purgeSoftDeletedUsersPastGracePeriod(): Promise<void> {
    return this.usersService.purgeSoftDeletedUsersPastGracePeriod();
  }
}
