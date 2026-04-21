import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterResponseDto } from './dto/auth-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('auth')
@ApiExtraModels(RegisterDto, LoginDto, RegisterResponseDto, LoginResponseDto)
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates an account. **Required body fields:** `email`, `password` (strong), `firstName`, `lastName`, `phone` (7–15 digits only, e.g. `15551234567`). Returns `message`, `accessToken`, `refreshToken`, and `user` (including `phone`).',
  })
  @ApiCreatedResponse({
    description: 'Created',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Validation error (e.g. weak password or invalid phone format)',
  })
  @ApiConflictResponse({
    description: 'Email already registered',
  })
  @ApiBody({
    type: RegisterDto,
    description:
      'All fields are required, including **phone** (7–15 digits only, no + or separators).',
  })
  register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in',
    description:
      '**Body:** `email` and `password` only. **Response:** `message`, `accessToken`, and `user` — no `refreshToken`.',
  })
  @ApiOkResponse({
    description: 'OK',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }
}
