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
import { ApiFailureTag } from '../logging';
import { apiResponse, type ApiDataResponse } from '../common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { CreateEventDto } from './dto/create-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import {
  EventApiResponseDto,
  EventListApiResponseDto,
} from './dto/events-api-response.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  EVENT_BUY_TICKET_SUCCESS_MESSAGE,
  EVENT_CALCULATE_CHARGES_SUCCESS_MESSAGE,
  EVENT_CREATE_SUCCESS_MESSAGE,
  EVENT_DELETE_SUCCESS_MESSAGE,
  EVENT_GET_SUCCESS_MESSAGE,
  EVENT_UPDATE_SUCCESS_MESSAGE,
  EVENTS_LIST_SUCCESS_MESSAGE,
} from './events.messages';
import { toEventResponseDto } from './mappers/event.mapper';
import { EventsService } from './events.service';

const partnerProxyOkResponse = {
  description: 'Partner API response envelope',
  schema: {
    type: 'object',
    required: ['statusCode', 'message', 'data'],
    properties: {
      statusCode: { type: 'number', example: 200 },
      message: { type: 'string' },
      data: { type: 'object', additionalProperties: true },
    },
  },
} as const;

const eventDeleteOkResponse = {
  description: 'Event deleted',
  schema: {
    type: 'object',
    required: ['statusCode', 'message', 'data'],
    properties: {
      statusCode: { type: 'number', example: 200 },
      message: { type: 'string', example: 'Event deleted successfully' },
      data: { nullable: true, example: null },
    },
  },
} as const;

@ApiTags('events')
@ApiFailureTag('events')
@ApiExtraModels(
  CreateEventDto,
  UpdateEventDto,
  EventResponseDto,
  EventListApiResponseDto,
  EventApiResponseDto,
)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Admin role required' })
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a local event (admin only)' })
  @ApiBody({ type: CreateEventDto })
  @ApiCreatedResponse({ type: EventApiResponseDto })
  async create(
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: CreateEventDto,
  ) {
    const event = await this.eventsService.create(dto, current.sub);
    return apiResponse(
      toEventResponseDto(event),
      EVENT_CREATE_SUCCESS_MESSAGE,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List events',
    description:
      'Returns locally managed events plus bookable partner events from eGotickets.',
  })
  @ApiOkResponse({ type: EventListApiResponseDto })
  async findAll() {
    const events = await this.eventsService.findAll();
    return apiResponse(events, EVENTS_LIST_SUCCESS_MESSAGE);
  }

  @Post(':id/calculate_charges')
  @ApiOperation({
    summary: 'Calculate ticket charges (partner events)',
    description:
      'Proxies to the eGotickets partner API. Request body is forwarded as-is.',
  })
  @ApiBody({
    schema: { type: 'object', additionalProperties: true },
  })
  @ApiOkResponse({
    ...partnerProxyOkResponse,
    description: 'Charge breakdown from partner API',
  })
  async calculateCharges(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<ApiDataResponse<Record<string, unknown>>> {
    const data = await this.eventsService.calculateCharges(id, body);
    return apiResponse(data, EVENT_CALCULATE_CHARGES_SUCCESS_MESSAGE);
  }

  @Post(':id/buy_ticket')
  @ApiOperation({
    summary: 'Buy ticket (partner events)',
    description:
      'Proxies to the eGotickets partner API. Request body is forwarded as-is.',
  })
  @ApiBody({
    schema: { type: 'object', additionalProperties: true },
  })
  @ApiOkResponse({
    ...partnerProxyOkResponse,
    description: 'Purchase result from partner API',
  })
  async buyTicket(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<ApiDataResponse<Record<string, unknown>>> {
    const data = await this.eventsService.buyTicket(id, body);
    return apiResponse(data, EVENT_BUY_TICKET_SUCCESS_MESSAGE);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one event by id (local UUID or partner id)' })
  @ApiOkResponse({ type: EventApiResponseDto })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.findOne(id);
    return apiResponse(event, EVENT_GET_SUCCESS_MESSAGE);
  }

  @Patch(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a local event (admin only)' })
  @ApiBody({ type: UpdateEventDto })
  @ApiOkResponse({ type: EventApiResponseDto })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: UpdateEventDto,
  ) {
    const event = await this.eventsService.update(id, dto, current.sub);
    return apiResponse(toEventResponseDto(event), EVENT_UPDATE_SUCCESS_MESSAGE);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a local event (admin only)' })
  @ApiOkResponse(eventDeleteOkResponse)
  @ApiNotFoundResponse({ description: 'Event not found' })
  async remove(@Param('id') id: string): Promise<ApiDataResponse<null>> {
    await this.eventsService.remove(id);
    return apiResponse(null, EVENT_DELETE_SUCCESS_MESSAGE);
  }
}
