import {
  normalizePartnerEvent,
  normalizePartnerEventsList,
} from './normalize-partner-events.util';

const sampleEvent = {
  id: 60371,
  name: 'Ticketing Integration Test Event',
  category_name: 'Business & Professional',
  date_status: 'upcoming',
  venue_name: 'MTN Head Office',
  city: 'Accra',
  address: 'MTN Head Office, Independence Avenue, Accra, Ghana',
  friendly_price: '₵50+',
  startdate: '2026-07-25T11:30:00.000Z',
  enddate: '2026-07-26T03:00:00.000Z',
};

describe('normalizePartnerEventsList', () => {
  it('accepts a raw array from the partner API', () => {
    expect(normalizePartnerEventsList([sampleEvent])).toEqual([sampleEvent]);
  });

  it('accepts a data envelope', () => {
    expect(normalizePartnerEventsList({ data: [sampleEvent] })).toEqual([
      sampleEvent,
    ]);
  });

  it('returns an empty array for unrecognized payloads', () => {
    expect(normalizePartnerEventsList({ ok: true })).toEqual([]);
  });
});

describe('normalizePartnerEvent', () => {
  it('accepts a raw event object', () => {
    expect(normalizePartnerEvent(sampleEvent)).toEqual(sampleEvent);
  });

  it('accepts a data envelope', () => {
    expect(normalizePartnerEvent({ data: sampleEvent })).toEqual(sampleEvent);
  });
});
