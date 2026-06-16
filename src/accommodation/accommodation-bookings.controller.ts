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
  ACCOMMODATION_BOOKING_CREATE_SUCCESS_MESSAGE,
  ACCOMMODATION_BOOKING_GET_SUCCESS_MESSAGE,
  ACCOMMODATION_BOOKINGS_LIST_SUCCESS_MESSAGE,
} from './accommodation.messages';
import { AccommodationBookingsService } from './accommodation-bookings.service';
import { AccommodationBookingResponseDto } from './dto/accommodation-booking-response.dto';
import {
  AccommodationBookingApiResponseDto,
  AccommodationBookingListApiResponseDto,
} from './dto/accommodation-bookings-api-response.dto';
import { CreateAccommodationBookingDto } from './dto/create-accommodation-booking.dto';
import { toAccommodationBookingResponseDto } from './mappers/accommodation-booking.mapper';

@ApiTags('accommodation-bookings')
@ApiFailureTag('accommodation-bookings')
@ApiExtraModels(
  CreateAccommodationBookingDto,
  AccommodationBookingResponseDto,
  AccommodationBookingListApiResponseDto,
  AccommodationBookingApiResponseDto,
)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Insufficient permissions' })
@Controller('accommodation/bookings')
export class AccommodationBookingsController {
  constructor(private readonly bookingsService: AccommodationBookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Book accommodation',
    description:
      'Authenticated users can book for themselves or for someone else. When `isBookingForSelf` is false, `guestFirstName`, `guestLastName`, `guestEmail`, and `guestPhone` are required. `bookedByUserId` is always taken from the access token.',
  })
  @ApiBody({ type: CreateAccommodationBookingDto })
  @ApiCreatedResponse({ type: AccommodationBookingApiResponseDto })
  async create(
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: CreateAccommodationBookingDto,
  ) {
    const booking = await this.bookingsService.create(dto, current);
    return apiResponse(
      toAccommodationBookingResponseDto(booking),
      ACCOMMODATION_BOOKING_CREATE_SUCCESS_MESSAGE,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List accommodation bookings',
    description:
      'Users see their own bookings. Admins and super_admins see all bookings.',
  })
  @ApiOkResponse({ type: AccommodationBookingListApiResponseDto })
  async findAll(@CurrentUser() current: JwtPayloadUser) {
    const bookings = await this.bookingsService.findAll(current);
    return apiResponse(
      bookings.map(toAccommodationBookingResponseDto),
      ACCOMMODATION_BOOKINGS_LIST_SUCCESS_MESSAGE,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one accommodation booking',
    description:
      'Users can view their own booking. Admins and super_admins can view any booking.',
  })
  @ApiOkResponse({ type: AccommodationBookingApiResponseDto })
  @ApiNotFoundResponse({ description: 'Accommodation booking not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() current: JwtPayloadUser,
  ) {
    const booking = await this.bookingsService.findOne(id, current);
    return apiResponse(
      toAccommodationBookingResponseDto(booking),
      ACCOMMODATION_BOOKING_GET_SUCCESS_MESSAGE,
    );
  }
}
