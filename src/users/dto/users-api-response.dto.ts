import { ApiProperty } from '@nestjs/swagger';
import { ApiMessageResponseDto } from '../../common/dto/api-data-response.dto';
import { AccountDeletionDataDto } from './account-deletion-response.dto';
import { UserResponseDto } from './user-response.dto';

export class UserApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'User profile retrieved successfully' })
  message: string;

  @ApiProperty({ type: UserResponseDto })
  data: UserResponseDto;
}

export class UserListApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Users retrieved successfully' })
  message: string;

  @ApiProperty({ type: UserResponseDto, isArray: true })
  data: UserResponseDto[];
}

export class AccountDeletionApiResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: AccountDeletionDataDto })
  data: AccountDeletionDataDto;
}

export { ApiMessageResponseDto as UserPasswordChangeApiResponseDto };
