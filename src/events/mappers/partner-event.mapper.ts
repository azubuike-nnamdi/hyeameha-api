import { EventResponseDto } from '../dto/event-response.dto';
import type {
  PartnerEvent,
  PartnerEventTicket,
} from '../types/partner-event.types';

function mapDateStatus(dateStatus: string): string {
  const normalized = dateStatus.toLowerCase();
  if (normalized === 'upcoming') {
    return 'new';
  }
  if (normalized === 'ongoing' || normalized === 'live') {
    return 'ongoing';
  }
  if (normalized === 'past' || normalized === 'ended') {
    return 'popular';
  }
  return 'new';
}

function toEventDate(isoDate: string): string {
  return isoDate.slice(0, 10);
}

export function toPartnerEventResponseDto(
  event: PartnerEvent,
  options?: { includeTickets?: boolean },
): EventResponseDto {
  const image =
    event.banner_photo?.url ??
    'https://placehold.co/800x400/1a1a2e/fff?text=Event';
  const location =
    event.address?.trim() ||
    [event.venue_name, event.city].filter(Boolean).join(', ');

  return {
    id: String(event.id),
    title: event.name,
    location,
    image,
    eventDate: toEventDate(event.startdate),
    status: mapDateStatus(event.date_status),
    type: event.category_name,
    price: event.friendly_price,
    source: 'partner',
    createdAt: new Date(event.startdate),
    updatedAt: new Date(event.enddate),
    updatedBy: null,
    tickets:
      options?.includeTickets && event.tickets
        ? event.tickets.map(toPartnerTicketDto)
        : undefined,
  };
}

function toPartnerTicketDto(ticket: PartnerEventTicket) {
  return {
    id: ticket.id,
    name: ticket.name,
    quantity: ticket.quantity,
    maxPerTicket: ticket.max_per_ticket,
    stopSales: ticket.stop_sales,
    price: ticket.price,
    realPrice: ticket.real_price,
    fee: ticket.fee,
    insuranceFee: ticket.insurance_fee,
  };
}
