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
  RIDE_BOOKING_CREATE_SUCCESS_MESSAGE,
  RIDE_BOOKING_GET_SUCCESS_MESSAGE,
  RIDE_BOOKINGS_LIST_SUCCESS_MESSAGE,
  RIDE_PRICE_CALCULATED_SUCCESS_MESSAGE,
} from './rides.messages';
import { RideBookingsService } from './ride-bookings.service';
import { CalculateRidePriceDto } from './dto/calculate-ride-price.dto';
import { CreateRideBookingDto } from './dto/create-ride-booking.dto';
import { RideBookingResponseDto } from './dto/ride-booking-response.dto';
import {
  RideBookingApiResponseDto,
  RideBookingListApiResponseDto,
  RidePriceApiResponseDto,
} from './dto/ride-bookings-api-response.dto';
import { RidePriceResponseDto } from './dto/ride-price-response.dto';
import { toRideBookingResponseDto } from './mappers/ride-booking.mapper';

@ApiTags('ride-bookings')
@ApiFailureTag('ride-bookings')
@ApiExtraModels(
  CreateRideBookingDto,
  CalculateRidePriceDto,
  RideBookingResponseDto,
  RidePriceResponseDto,
  RideBookingListApiResponseDto,
  RideBookingApiResponseDto,
  RidePriceApiResponseDto,
)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Insufficient permissions' })
@Controller('rides/bookings')
export class RideBookingsController {
  constructor(private readonly bookingsService: RideBookingsService) {}

  @Post('calculate-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate ride booking price',
    description:
      'Returns the GHS price for the selected ride and number of days. Use this to display the price before booking.',
  })
  @ApiBody({ type: CalculateRidePriceDto })
  @ApiOkResponse({ type: RidePriceApiResponseDto })
  async calculatePrice(@Body() dto: CalculateRidePriceDto) {
    const price = await this.bookingsService.calculatePrice(dto);
    return apiResponse(price, RIDE_PRICE_CALCULATED_SUCCESS_MESSAGE);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Book a ride',
    description:
      'Authenticated users can book for themselves or for someone else. When `isBookingForSelf` is false, guest fields are required. Price is calculated from the ride daily rate × number of days. Passenger count must not exceed the ride maxPassengers.',
  })
  @ApiBody({ type: CreateRideBookingDto })
  @ApiCreatedResponse({ type: RideBookingApiResponseDto })
  async create(
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: CreateRideBookingDto,
  ) {
    const booking = await this.bookingsService.create(dto, current);
    return apiResponse(
      toRideBookingResponseDto(booking),
      RIDE_BOOKING_CREATE_SUCCESS_MESSAGE,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List ride bookings',
    description:
      'Users see their own bookings. Admins and super_admins see all bookings.',
  })
  @ApiOkResponse({ type: RideBookingListApiResponseDto })
  async findAll(@CurrentUser() current: JwtPayloadUser) {
    const bookings = await this.bookingsService.findAll(current);
    return apiResponse(
      bookings.map(toRideBookingResponseDto),
      RIDE_BOOKINGS_LIST_SUCCESS_MESSAGE,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one ride booking',
    description:
      'Users can view their own booking. Admins and super_admins can view any booking.',
  })
  @ApiOkResponse({ type: RideBookingApiResponseDto })
  @ApiNotFoundResponse({ description: 'Ride booking not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() current: JwtPayloadUser,
  ) {
    const booking = await this.bookingsService.findOne(id, current);
    return apiResponse(
      toRideBookingResponseDto(booking),
      RIDE_BOOKING_GET_SUCCESS_MESSAGE,
    );
  }
}
