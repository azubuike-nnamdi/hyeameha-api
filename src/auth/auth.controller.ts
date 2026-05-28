import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
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
import type { Request } from 'express';
import { Public, apiResponse } from '../common';
import { ApiFailureTag } from '../logging';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthLoginApiResponseDto,
  AuthMessageApiResponseDto,
  AuthRefreshApiResponseDto,
  AuthRegisterApiResponseDto,
} from './dto/auth-api-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  AUTH_FORGOT_PASSWORD_MESSAGE,
  AUTH_LOGIN_SUCCESS_MESSAGE,
  AUTH_REFRESH_SUCCESS_MESSAGE,
  AUTH_REGISTER_SUCCESS_MESSAGE,
  AUTH_RESET_PASSWORD_MESSAGE,
} from './auth.messages';
import { getLoginContext } from './utils/login-context.util';

@ApiTags('auth')
@ApiExtraModels(
  RegisterDto,
  LoginDto,
  AuthRegisterApiResponseDto,
  AuthLoginApiResponseDto,
  AuthRefreshApiResponseDto,
  AuthMessageApiResponseDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
)
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Post('register')
  @ApiFailureTag('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates an account and sends a welcome email. Returns tokens and `user` in `data`.',
  })
  @ApiCreatedResponse({
    description: 'Created',
    type: AuthRegisterApiResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Validation error (e.g. weak password or invalid phone format)',
  })
  @ApiConflictResponse({
    description: 'Email already registered',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return apiResponse(data, AUTH_REGISTER_SUCCESS_MESSAGE, HttpStatus.CREATED);
  }

  @Post('login')
  @ApiFailureTag('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in',
    description:
      'Authenticates the user, returns tokens and `user` in `data`, and sends a login notification email with IP / device details.',
  })
  @ApiOkResponse({
    description: 'OK',
    type: AuthLoginApiResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const data = await this.authService.login(dto, getLoginContext(req));
    return apiResponse(data, AUTH_LOGIN_SUCCESS_MESSAGE);
  }

  @Post('refresh')
  @ApiFailureTag('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      '**Body:** `refreshToken` from login or register. Returns new tokens in `data`.',
  })
  @ApiOkResponse({
    description: 'OK',
    type: AuthRefreshApiResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({
    description: 'Invalid, expired, or revoked refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refresh(dto.refreshToken);
    return apiResponse(data, AUTH_REFRESH_SUCCESS_MESSAGE);
  }

  @Post('forgot-password')
  @ApiFailureTag('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset OTP',
    description:
      'Sends a one-time code to the email if an account exists. Response is always the same to avoid email enumeration.',
  })
  @ApiOkResponse({ type: AuthMessageApiResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.passwordResetService.requestPasswordReset(dto.email);
    return apiResponse(null, AUTH_FORGOT_PASSWORD_MESSAGE);
  }

  @Post('reset-password')
  @ApiFailureTag('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with OTP',
    description:
      'Verifies the OTP from email, sets a new password, deletes the OTP record, and revokes refresh tokens.',
  })
  @ApiOkResponse({ type: AuthMessageApiResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired verification code',
  })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.passwordResetService.resetPassword(
      dto.email,
      dto.otp,
      dto.newPassword,
    );
    return apiResponse(null, AUTH_RESET_PASSWORD_MESSAGE);
  }
}
