import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartnerEventTicketDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  maxPerTicket: number;

  @ApiProperty()
  stopSales: boolean;

  @ApiProperty()
  price: string;

  @ApiProperty()
  realPrice: string;

  @ApiProperty()
  fee: number;

  @ApiProperty()
  insuranceFee: string;
}

export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  image: string;

  @ApiProperty({ description: 'ISO date YYYY-MM-DD' })
  eventDate: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  price: string;

  @ApiProperty({ enum: ['local', 'partner'] })
  source: 'local' | 'partner';

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  updatedBy: string | null;

  @ApiPropertyOptional({
    type: PartnerEventTicketDto,
    isArray: true,
    description: 'Ticket types (partner events only, on GET /events/:id)',
  })
  tickets?: PartnerEventTicketDto[];
}
