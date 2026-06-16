import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BUDGET_MANAGE_ROLES } from '../users/constants/user-role';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { apiResponse, type ApiDataResponse } from '../common';
import { ApiFailureTag } from '../logging';
import {
  ACCOMMODATION_BUDGET_CREATE_SUCCESS_MESSAGE,
  ACCOMMODATION_BUDGET_DELETE_SUCCESS_MESSAGE,
  ACCOMMODATION_BUDGET_GET_SUCCESS_MESSAGE,
  ACCOMMODATION_BUDGET_UPDATE_SUCCESS_MESSAGE,
  ACCOMMODATION_BUDGETS_LIST_SUCCESS_MESSAGE,
} from './accommodation.messages';
import { AccommodationBudgetsService } from './accommodation-budgets.service';
import { AccommodationBudgetResponseDto } from './dto/accommodation-budget-response.dto';
import {
  AccommodationBudgetApiResponseDto,
  AccommodationBudgetDeleteApiResponseDto,
  AccommodationBudgetListApiResponseDto,
} from './dto/accommodation-budgets-api-response.dto';
import { CreateAccommodationBudgetDto } from './dto/create-accommodation-budget.dto';
import { UpdateAccommodationBudgetDto } from './dto/update-accommodation-budget.dto';
import { toAccommodationBudgetResponseDto } from './mappers/accommodation-budget.mapper';

@ApiTags('accommodation-budgets')
@ApiFailureTag('accommodation-budgets')
@ApiExtraModels(
  CreateAccommodationBudgetDto,
  UpdateAccommodationBudgetDto,
  AccommodationBudgetResponseDto,
  AccommodationBudgetListApiResponseDto,
  AccommodationBudgetApiResponseDto,
  AccommodationBudgetDeleteApiResponseDto,
)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Requires super_admin or admin role' })
@Controller('accommodation/budgets')
export class AccommodationBudgetsController {
  constructor(private readonly budgetsService: AccommodationBudgetsService) {}

  @Post()
  @Roles(...BUDGET_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an accommodation budget tier (admin only)' })
  @ApiBody({ type: CreateAccommodationBudgetDto })
  @ApiCreatedResponse({ type: AccommodationBudgetApiResponseDto })
  async create(
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: CreateAccommodationBudgetDto,
  ) {
    const budget = await this.budgetsService.create(dto, current.sub);
    return apiResponse(
      toAccommodationBudgetResponseDto(budget),
      ACCOMMODATION_BUDGET_CREATE_SUCCESS_MESSAGE,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List accommodation budget tiers',
    description: 'Available to all authenticated users.',
  })
  @ApiOkResponse({ type: AccommodationBudgetListApiResponseDto })
  async findAll() {
    const budgets = await this.budgetsService.findAll();
    return apiResponse(
      budgets.map(toAccommodationBudgetResponseDto),
      ACCOMMODATION_BUDGETS_LIST_SUCCESS_MESSAGE,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one accommodation budget tier',
    description: 'Available to all authenticated users.',
  })
  @ApiOkResponse({ type: AccommodationBudgetApiResponseDto })
  @ApiNotFoundResponse({ description: 'Accommodation budget not found' })
  async findOne(@Param('id') id: string) {
    const budget = await this.budgetsService.findOne(id);
    return apiResponse(
      toAccommodationBudgetResponseDto(budget),
      ACCOMMODATION_BUDGET_GET_SUCCESS_MESSAGE,
    );
  }

  @Patch(':id')
  @Roles(...BUDGET_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update an accommodation budget tier (admin only)' })
  @ApiBody({ type: UpdateAccommodationBudgetDto })
  @ApiOkResponse({ type: AccommodationBudgetApiResponseDto })
  @ApiNotFoundResponse({ description: 'Accommodation budget not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: UpdateAccommodationBudgetDto,
  ) {
    const budget = await this.budgetsService.update(id, dto, current.sub);
    return apiResponse(
      toAccommodationBudgetResponseDto(budget),
      ACCOMMODATION_BUDGET_UPDATE_SUCCESS_MESSAGE,
    );
  }

  @Delete(':id')
  @Roles(...BUDGET_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an accommodation budget tier (admin only)' })
  @ApiOkResponse({ type: AccommodationBudgetDeleteApiResponseDto })
  @ApiNotFoundResponse({ description: 'Accommodation budget not found' })
  async remove(@Param('id') id: string): Promise<ApiDataResponse<null>> {
    await this.budgetsService.remove(id);
    return apiResponse(null, ACCOMMODATION_BUDGET_DELETE_SUCCESS_MESSAGE);
  }
}
