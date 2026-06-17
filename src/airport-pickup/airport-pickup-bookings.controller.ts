import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { apiResponse } from '../common';
import { ApiFailureTag } from '../logging';
import {
  AIRPORT_PICKUP_BOOKING_CREATE_SUCCESS_MESSAGE,
  AIRPORT_PICKUP_BOOKING_GET_SUCCESS_MESSAGE,
  AIRPORT_PICKUP_BOOKINGS_LIST_SUCCESS_MESSAGE,
  AIRPORT_PICKUP_PRICE_CALCULATED_SUCCESS_MESSAGE,
} from './airport-pickup.messages';
import { AirportPickupBookingsService } from './airport-pickup-bookings.service';
import { CalculateAirportPickupPriceDto } from './dto/calculate-airport-pickup-price.dto';
import { CreateAirportPickupBookingDto } from './dto/create-airport-pickup-booking.dto';
import { AirportPickupBookingResponseDto } from './dto/airport-pickup-booking-response.dto';
import {
  AirportPickupBookingApiResponseDto,
  AirportPickupBookingListApiResponseDto,
  AirportPickupPriceApiResponseDto,
} from './dto/airport-pickup-bookings-api-response.dto';
import { AirportPickupPriceResponseDto } from './dto/airport-pickup-price-response.dto';
import { toAirportPickupBookingResponseDto } from './mappers/airport-pickup-booking.mapper';

@ApiTags('airport-pickup-bookings')
@ApiFailureTag('airport-pickup-bookings')
@ApiExtraModels(
  CreateAirportPickupBookingDto,
  CalculateAirportPickupPriceDto,
  AirportPickupBookingResponseDto,
  AirportPickupPriceResponseDto,
  AirportPickupBookingListApiResponseDto,
  AirportPickupBookingApiResponseDto,
  AirportPickupPriceApiResponseDto,
)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Insufficient permissions' })
@Controller('airport-pickup/bookings')
export class AirportPickupBookingsController {
  constructor(private readonly bookingsService: AirportPickupBookingsService) {}

  @Post('calculate-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate airport pickup price',
    description:
      'Returns the GHS price for the given passenger count. Use this to display the price before booking.',
  })
  @ApiBody({ type: CalculateAirportPickupPriceDto })
  @ApiOkResponse({ type: AirportPickupPriceApiResponseDto })
  calculatePrice(@Body() dto: CalculateAirportPickupPriceDto) {
    const price = this.bookingsService.calculatePrice(dto);
    return apiResponse(price, AIRPORT_PICKUP_PRICE_CALCULATED_SUCCESS_MESSAGE);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Book airport pickup',
    description:
      'Authenticated users can book for themselves or for someone else. When `isBookingForSelf` is false, `guestFirstName`, `guestLastName`, `guestEmail`, and `guestPhone` are required. Price is calculated automatically from passenger count.',
  })
  @ApiBody({ type: CreateAirportPickupBookingDto })
  @ApiCreatedResponse({ type: AirportPickupBookingApiResponseDto })
  async create(
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: CreateAirportPickupBookingDto,
  ) {
    const booking = await this.bookingsService.create(dto, current);
    return apiResponse(
      toAirportPickupBookingResponseDto(booking),
      AIRPORT_PICKUP_BOOKING_CREATE_SUCCESS_MESSAGE,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List airport pickup bookings',
    description:
      'Users see their own bookings. Admins and super_admins see all bookings.',
  })
  @ApiOkResponse({ type: AirportPickupBookingListApiResponseDto })
  async findAll(@CurrentUser() current: JwtPayloadUser) {
    const bookings = await this.bookingsService.findAll(current);
    return apiResponse(
      bookings.map(toAirportPickupBookingResponseDto),
      AIRPORT_PICKUP_BOOKINGS_LIST_SUCCESS_MESSAGE,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one airport pickup booking',
    description:
      'Users can view their own booking. Admins and super_admins can view any booking.',
  })
  @ApiOkResponse({ type: AirportPickupBookingApiResponseDto })
  @ApiNotFoundResponse({ description: 'Airport pickup booking not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() current: JwtPayloadUser,
  ) {
    const booking = await this.bookingsService.findOne(id, current);
    return apiResponse(
      toAirportPickupBookingResponseDto(booking),
      AIRPORT_PICKUP_BOOKING_GET_SUCCESS_MESSAGE,
    );
  }
}
