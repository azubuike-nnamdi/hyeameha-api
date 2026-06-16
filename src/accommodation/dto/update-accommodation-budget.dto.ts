import { PartialType } from '@nestjs/swagger';
import { CreateAccommodationBudgetDto } from './create-accommodation-budget.dto';

export class UpdateAccommodationBudgetDto extends PartialType(
  CreateAccommodationBudgetDto,
) {}
