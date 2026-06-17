import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiFailureTag } from '../logging';
import { apiResponse } from '../common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { USER_LIST_ROLES } from './constants/user-role';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  AccountDeletionApiResponseDto,
  UserApiResponseDto,
  UserListApiResponseDto,
  UserPasswordChangeApiResponseDto,
} from './dto/users-api-response.dto';
import { toUserResponseDto } from './mappers/user.mapper';
import {
  USER_ACCOUNT_DELETION_SUCCESS_MESSAGE,
  USER_PASSWORD_CHANGE_SUCCESS_MESSAGE,
  USER_PROFILE_SUCCESS_MESSAGE,
  USER_UPDATE_SUCCESS_MESSAGE,
  USERS_LIST_SUCCESS_MESSAGE,
} from './users.messages';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiFailureTag('users')
@ApiExtraModels(
  UserResponseDto,
  UserApiResponseDto,
  UserListApiResponseDto,
  AccountDeletionApiResponseDto,
  UserPasswordChangeApiResponseDto,
)
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Get current authenticated user profile',
    description:
      'Returns `id`, `email`, `firstName`, `lastName`, `phone`, `role`, timestamps in `data`.',
  })
  @ApiOkResponse({ type: UserApiResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get('me')
  async me(@CurrentUser() current: JwtPayloadUser) {
    const user = await this.usersService.findProfileById(current.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return apiResponse(toUserResponseDto(user), USER_PROFILE_SUCCESS_MESSAGE);
  }

  @ApiOperation({
    summary: 'List users (sanitized fields)',
    description:
      '**super_admin or admin only.** Each item in `data` matches `UserResponseDto` (no secrets). Regular users should use `GET /users/me`.',
  })
  @ApiOkResponse({ type: UserListApiResponseDto })
  @ApiForbiddenResponse({ description: 'Requires super_admin or admin role' })
  @Roles(...USER_LIST_ROLES)
  @UseGuards(RolesGuard)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return apiResponse(
      users.map((u) => toUserResponseDto(u)),
      USERS_LIST_SUCCESS_MESSAGE,
    );
  }

  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Updates first name, last name, and/or phone. Email cannot be changed.',
  })
  @ApiOkResponse({ type: UserApiResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch('me')
  async update(
    @CurrentUser() current: JwtPayloadUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.usersService.update(current.sub, updateUserDto);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return apiResponse(toUserResponseDto(updated), USER_UPDATE_SUCCESS_MESSAGE);
  }

  @ApiOperation({ summary: 'Change password for the current user' })
  @ApiOkResponse({ type: UserPasswordChangeApiResponseDto })
  @HttpCode(HttpStatus.OK)
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
    return apiResponse(null, USER_PASSWORD_CHANGE_SUCCESS_MESSAGE);
  }

  @ApiOperation({
    summary: 'Request account deletion (soft delete)',
    description:
      'Marks the account for deletion, invalidates refresh tokens, and removes the account permanently after 7 days.',
  })
  @ApiOkResponse({ type: AccountDeletionApiResponseDto })
  @Delete('me')
  async remove(@CurrentUser() current: JwtPayloadUser) {
    const data = await this.usersService.requestAccountDeletion(current.sub);
    return apiResponse(data, USER_ACCOUNT_DELETION_SUCCESS_MESSAGE);
  }
}
