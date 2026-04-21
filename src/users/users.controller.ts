import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { AccountDeletionResponseDto } from './dto/account-deletion-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { toUserResponseDto } from './mappers/user.mapper';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @Get('me')
  async me(@CurrentUser() current: JwtPayloadUser) {
    const user = await this.usersService.findProfileById(current.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return toUserResponseDto(user);
  }

  @ApiOperation({ summary: 'List users (sanitized fields)' })
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((u) => toUserResponseDto(u));
  }

  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Updates first name, last name, and/or phone. Email cannot be changed.',
  })
  @Patch('me')
  async update(
    @CurrentUser() current: JwtPayloadUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.usersService.update(current.sub, updateUserDto);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return toUserResponseDto(updated);
  }

  @ApiOperation({ summary: 'Change password for the current user' })
  @ApiResponse({ status: 204, description: 'Password updated' })
  @HttpCode(204)
  @Post('me/password')
  async changePassword(
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      current.sub,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @ApiOperation({
    summary: 'Request account deletion (soft delete)',
    description:
      'Marks the account for deletion, invalidates refresh tokens, and removes the account permanently after 7 days.',
  })
  @ApiResponse({ status: 200, type: AccountDeletionResponseDto })
  @Delete('me')
  async remove(@CurrentUser() current: JwtPayloadUser) {
    return this.usersService.requestAccountDeletion(current.sub);
  }
}
