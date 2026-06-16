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
import { TRAINING_MANAGE_ROLES } from '../users/constants/user-role';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user';
import { apiResponse, type ApiDataResponse } from '../common';
import { ApiFailureTag } from '../logging';
import { CreateTrainingDto } from './dto/create-training.dto';
import { TrainingResponseDto } from './dto/training-response.dto';
import {
  TrainingApiResponseDto,
  TrainingDeleteApiResponseDto,
  TrainingListApiResponseDto,
} from './dto/trainings-api-response.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { toTrainingResponseDto } from './mappers/training.mapper';
import {
  TRAINING_CREATE_SUCCESS_MESSAGE,
  TRAINING_DELETE_SUCCESS_MESSAGE,
  TRAINING_GET_SUCCESS_MESSAGE,
  TRAINING_UPDATE_SUCCESS_MESSAGE,
  TRAININGS_LIST_SUCCESS_MESSAGE,
} from './training.messages';
import { TrainingService } from './training.service';

@ApiTags('trainings')
@ApiFailureTag('trainings')
@ApiExtraModels(
  CreateTrainingDto,
  UpdateTrainingDto,
  TrainingResponseDto,
  TrainingListApiResponseDto,
  TrainingApiResponseDto,
  TrainingDeleteApiResponseDto,
)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({
  description: 'Requires super_admin, admin, or editor role',
})
@Controller('trainings')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @Roles(...TRAINING_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a training programme',
    description:
      'Requires `super_admin`, `admin`, or `editor`. Regular `user` role cannot create trainings.',
  })
  @ApiBody({ type: CreateTrainingDto })
  @ApiCreatedResponse({ type: TrainingApiResponseDto })
  async create(
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: CreateTrainingDto,
  ) {
    const training = await this.trainingService.create(dto, current.sub);
    return apiResponse(
      toTrainingResponseDto(training),
      TRAINING_CREATE_SUCCESS_MESSAGE,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List training programmes',
    description: 'Available to all authenticated users.',
  })
  @ApiOkResponse({ type: TrainingListApiResponseDto })
  async findAll() {
    const trainings = await this.trainingService.findAll();
    return apiResponse(
      trainings.map(toTrainingResponseDto),
      TRAININGS_LIST_SUCCESS_MESSAGE,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one training programme by id',
    description: 'Available to all authenticated users.',
  })
  @ApiOkResponse({ type: TrainingApiResponseDto })
  @ApiNotFoundResponse({ description: 'Training not found' })
  async findOne(@Param('id') id: string) {
    const training = await this.trainingService.findOne(id);
    return apiResponse(
      toTrainingResponseDto(training),
      TRAINING_GET_SUCCESS_MESSAGE,
    );
  }

  @Patch(':id')
  @Roles(...TRAINING_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update a training programme',
    description:
      'Requires `super_admin`, `admin`, or `editor`. Regular `user` role cannot update trainings.',
  })
  @ApiBody({ type: UpdateTrainingDto })
  @ApiOkResponse({ type: TrainingApiResponseDto })
  @ApiNotFoundResponse({ description: 'Training not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() current: JwtPayloadUser,
    @Body() dto: UpdateTrainingDto,
  ) {
    const training = await this.trainingService.update(id, dto, current.sub);
    return apiResponse(
      toTrainingResponseDto(training),
      TRAINING_UPDATE_SUCCESS_MESSAGE,
    );
  }

  @Delete(':id')
  @Roles(...TRAINING_MANAGE_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a training programme',
    description:
      'Requires `super_admin`, `admin`, or `editor`. Regular `user` role cannot delete trainings.',
  })
  @ApiOkResponse({ type: TrainingDeleteApiResponseDto })
  @ApiNotFoundResponse({ description: 'Training not found' })
  async remove(@Param('id') id: string): Promise<ApiDataResponse<null>> {
    await this.trainingService.remove(id);
    return apiResponse(null, TRAINING_DELETE_SUCCESS_MESSAGE);
  }
}
