import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { CreateEventDto } from './dto/create-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { toEventResponseDto } from './mappers/event.mapper';
import { EventsService } from './events.service';

@ApiTags('events')
@ApiExtraModels(CreateEventDto, UpdateEventDto, EventResponseDto)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event' })
  @ApiBody({ type: CreateEventDto })
  @ApiCreatedResponse({ type: EventResponseDto })
  async create(
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: CreateEventDto,
  ) {
    const event = await this.eventsService.create(dto, current.sub);
    return toEventResponseDto(event);
  }

  @Get()
  @ApiOperation({ summary: 'List all events' })
  @ApiOkResponse({ type: EventResponseDto, isArray: true })
  async findAll() {
    const events = await this.eventsService.findAll();
    return events.map(toEventResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one event by id' })
  @ApiOkResponse({ type: EventResponseDto })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const event = await this.eventsService.findOne(id);
    return toEventResponseDto(event);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiBody({ type: UpdateEventDto })
  @ApiOkResponse({ type: EventResponseDto })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: UpdateEventDto,
  ) {
    const event = await this.eventsService.update(id, dto, current.sub);
    return toEventResponseDto(event);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an event' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.eventsService.remove(id);
  }
}
