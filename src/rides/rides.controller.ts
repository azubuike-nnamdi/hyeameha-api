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
import { RIDE_MANAGE_ROLES } from '../users/constants/user-role';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { apiResponse, type ApiDataResponse } from '../common';
import { ApiFailureTag } from '../logging';
import {
  RIDE_CREATE_SUCCESS_MESSAGE,
  RIDE_DELETE_SUCCESS_MESSAGE,
  RIDE_GET_SUCCESS_MESSAGE,
  RIDE_UPDATE_SUCCESS_MESSAGE,
  RIDES_LIST_SUCCESS_MESSAGE,
} from './rides.messages';
import { RidesService } from './rides.service';
import { SERVICE_TIERS } from './constants/service-tier';
import { VEHICLE_TYPES } from './constants/vehicle-type';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { RideResponseDto } from './dto/ride-response.dto';
import {
  RideApiResponseDto,
  RideDeleteApiResponseDto,
  RideListApiResponseDto,
} from './dto/rides-api-response.dto';
import { toRideResponseDto } from './mappers/ride.mapper';

@ApiTags('rides')
@ApiFailureTag('rides')
@ApiExtraModels(
  CreateRideDto,
  UpdateRideDto,
  RideResponseDto,
  RideListApiResponseDto,
  RideApiResponseDto,
  RideDeleteApiResponseDto,
)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({
  description: 'Requires super_admin, admin, or editor role',
})
@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  @Roles(...RIDE_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload a ride to the catalog',
    description:
      'Requires `super_admin`, `admin`, or `editor`. Each vehicle type + service tier combination must be unique.',
  })
  @ApiBody({ type: CreateRideDto })
  @ApiCreatedResponse({ type: RideApiResponseDto })
  async create(
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: CreateRideDto,
  ) {
    const ride = await this.ridesService.create(dto, current.sub);
    return apiResponse(
      toRideResponseDto(ride),
      RIDE_CREATE_SUCCESS_MESSAGE,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List rides',
    description:
      'Available to all authenticated users. Used to populate vehicle selection on the booking form.',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description:
      'When true (default), returns only active rides. Set to false to include inactive rides.',
  })
  @ApiQuery({
    name: 'vehicleType',
    required: false,
    enum: VEHICLE_TYPES,
    description: 'Filter by vehicle type.',
  })
  @ApiQuery({
    name: 'serviceTier',
    required: false,
    enum: SERVICE_TIERS,
    description: 'Filter by service tier (Regular, Comfort, VVIP).',
  })
  @ApiOkResponse({ type: RideListApiResponseDto })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
    @Query('vehicleType') vehicleType?: string,
    @Query('serviceTier') serviceTier?: string,
  ) {
    const rides = await this.ridesService.findAll({
      activeOnly: activeOnly !== 'false',
      vehicleType: vehicleType as (typeof VEHICLE_TYPES)[number] | undefined,
      serviceTier: serviceTier as (typeof SERVICE_TIERS)[number] | undefined,
    });
    return apiResponse(
      rides.map(toRideResponseDto),
      RIDES_LIST_SUCCESS_MESSAGE,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one ride by id',
    description: 'Available to all authenticated users.',
  })
  @ApiOkResponse({ type: RideApiResponseDto })
  @ApiNotFoundResponse({ description: 'Ride not found' })
  async findOne(@Param('id') id: string) {
    const ride = await this.ridesService.findOne(id);
    return apiResponse(toRideResponseDto(ride), RIDE_GET_SUCCESS_MESSAGE);
  }

  @Patch(':id')
  @Roles(...RIDE_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update a ride',
    description:
      'Requires `super_admin`, `admin`, or `editor`. Regular `user` role cannot update rides.',
  })
  @ApiBody({ type: UpdateRideDto })
  @ApiOkResponse({ type: RideApiResponseDto })
  @ApiNotFoundResponse({ description: 'Ride not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: UpdateRideDto,
  ) {
    const ride = await this.ridesService.update(id, dto, current.sub);
    return apiResponse(toRideResponseDto(ride), RIDE_UPDATE_SUCCESS_MESSAGE);
  }

  @Delete(':id')
  @Roles(...RIDE_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a ride',
    description:
      'Requires `super_admin`, `admin`, or `editor`. Cannot delete rides referenced by bookings.',
  })
  @ApiOkResponse({ type: RideDeleteApiResponseDto })
  @ApiNotFoundResponse({ description: 'Ride not found' })
  async remove(@Param('id') id: string): Promise<ApiDataResponse<null>> {
    await this.ridesService.remove(id);
    return apiResponse(null, RIDE_DELETE_SUCCESS_MESSAGE);
  }
}
