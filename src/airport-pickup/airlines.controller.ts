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
  Query,
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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AIRLINE_MANAGE_ROLES } from '../users/constants/user-role';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { apiResponse, type ApiDataResponse } from '../common';
import { ApiFailureTag } from '../logging';
import {
  AIRLINE_CREATE_SUCCESS_MESSAGE,
  AIRLINE_DELETE_SUCCESS_MESSAGE,
  AIRLINE_GET_SUCCESS_MESSAGE,
  AIRLINE_UPDATE_SUCCESS_MESSAGE,
  AIRLINES_LIST_SUCCESS_MESSAGE,
} from './airport-pickup.messages';
import { AirlinesService } from './airlines.service';
import { AirlineResponseDto } from './dto/airline-response.dto';
import {
  AirlineApiResponseDto,
  AirlineDeleteApiResponseDto,
  AirlineListApiResponseDto,
} from './dto/airlines-api-response.dto';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
import { toAirlineResponseDto } from './mappers/airline.mapper';

@ApiTags('airport-pickup-airlines')
@ApiFailureTag('airport-pickup-airlines')
@ApiExtraModels(
  CreateAirlineDto,
  UpdateAirlineDto,
  AirlineResponseDto,
  AirlineListApiResponseDto,
  AirlineApiResponseDto,
  AirlineDeleteApiResponseDto,
)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({
  description: 'Requires super_admin, admin, or editor role',
})
@Controller('airport-pickup/airlines')
export class AirlinesController {
  constructor(private readonly airlinesService: AirlinesService) {}

  @Post()
  @Roles(...AIRLINE_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create an airline',
    description:
      'Requires `super_admin`, `admin`, or `editor`. Regular `user` role cannot create airlines.',
  })
  @ApiBody({ type: CreateAirlineDto })
  @ApiCreatedResponse({ type: AirlineApiResponseDto })
  async create(
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: CreateAirlineDto,
  ) {
    const airline = await this.airlinesService.create(dto, current.sub);
    return apiResponse(
      toAirlineResponseDto(airline),
      AIRLINE_CREATE_SUCCESS_MESSAGE,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List airlines',
    description:
      'Available to all authenticated users. Used to populate the airline dropdown on the booking form.',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description:
      'When true (default), returns only active airlines. Set to false to include inactive airlines.',
  })
  @ApiOkResponse({ type: AirlineListApiResponseDto })
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const onlyActive = activeOnly !== 'false';
    const airlines = await this.airlinesService.findAll(onlyActive);
    return apiResponse(
      airlines.map(toAirlineResponseDto),
      AIRLINES_LIST_SUCCESS_MESSAGE,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one airline by id',
    description: 'Available to all authenticated users.',
  })
  @ApiOkResponse({ type: AirlineApiResponseDto })
  @ApiNotFoundResponse({ description: 'Airline not found' })
  async findOne(@Param('id') id: string) {
    const airline = await this.airlinesService.findOne(id);
    return apiResponse(
      toAirlineResponseDto(airline),
      AIRLINE_GET_SUCCESS_MESSAGE,
    );
  }

  @Patch(':id')
  @Roles(...AIRLINE_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update an airline',
    description:
      'Requires `super_admin`, `admin`, or `editor`. Regular `user` role cannot update airlines.',
  })
  @ApiBody({ type: UpdateAirlineDto })
  @ApiOkResponse({ type: AirlineApiResponseDto })
  @ApiNotFoundResponse({ description: 'Airline not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: UpdateAirlineDto,
  ) {
    const airline = await this.airlinesService.update(id, dto, current.sub);
    return apiResponse(
      toAirlineResponseDto(airline),
      AIRLINE_UPDATE_SUCCESS_MESSAGE,
    );
  }

  @Delete(':id')
  @Roles(...AIRLINE_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an airline',
    description:
      'Requires `super_admin`, `admin`, or `editor`. Cannot delete airlines referenced by bookings.',
  })
  @ApiOkResponse({ type: AirlineDeleteApiResponseDto })
  @ApiNotFoundResponse({ description: 'Airline not found' })
  async remove(@Param('id') id: string): Promise<ApiDataResponse<null>> {
    await this.airlinesService.remove(id);
    return apiResponse(null, AIRLINE_DELETE_SUCCESS_MESSAGE);
  }
}
