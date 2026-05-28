import type { Event } from '../../events/entities/event.entity';

export type EventSeedRow = Pick<
  Event,
  'title' | 'location' | 'image' | 'eventDate' | 'status' | 'type' | 'price'
>;

export const DEFAULT_EVENTS: EventSeedRow[] = [
  {
    title: 'Global Tech Expo 2026',
    location: 'Convention Center, Accra',
    image: 'https://placehold.co/800x400/1a1a2e/fff?text=Global+Tech+Expo+2026',
    eventDate: '2026-01-24',
    status: 'popular',
    type: 'Technology',
    price: '$50',
  },
  {
    title: 'Vibrant Music Fest',
    location: 'Black Star Square, Accra',
    image: 'https://placehold.co/800x400/16213e/fff?text=Vibrant+Music+Fest',
    eventDate: '2026-08-15',
    status: 'ongoing',
    type: 'Entertainment',
    price: 'Free',
  },
  {
    title: 'Innovation Summit',
    location: 'Movenpick Hotel',
    image: 'https://placehold.co/800x400/0f3460/fff?text=Innovation+Summit',
    eventDate: '2026-02-10',
    status: 'new',
    type: 'Business',
    price: '$100',
  },
];

export const DEFAULT_EVENT_TITLES = DEFAULT_EVENTS.map((event) => event.title);
