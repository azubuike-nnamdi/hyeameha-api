import type { Training } from '../../training/entities/training.entity';

export type TrainingSeedRow = Pick<
  Training,
  'title' | 'location' | 'startTime' | 'endTime' | 'duration' | 'topics'
>;

export const DEFAULT_TRAININGS: TrainingSeedRow[] = [
  {
    title: 'Hair Braiding',
    location: 'Studio A, Hyeameha Training Centre, Accra',
    startTime: '9:00 AM',
    endTime: '11:00 PM',
    duration: '2 hours',
    topics: [
      'Introduction to Hair Braiding Techniques',
      'Basic Braiding Patterns (Simple braids, French braids)',
      'Hands-On Practice with Guidance',
    ],
  },
  {
    title: 'Cooking Lessons',
    location: 'Kitchen Lab, Hyeameha Training Centre, Accra',
    startTime: '9:00 AM',
    endTime: '11:00 PM',
    duration: '2 hours',
    topics: [
      'Introduction to local Ghanaian Dishes',
      'Preparing and Cooking a Simple Dish',
    ],
  },
  {
    title: 'Traditional Drumming Lessons',
    location: 'Outdoor Pavilion, Hyeameha Training Centre, Accra',
    startTime: '9:00 AM',
    endTime: '11:00 PM',
    duration: '2 hours',
    topics: [
      'Introduction to Basic Drumming Techniques',
      'Learning Basic Rhythms and Patterns',
      'Group Drumming Session and Practice',
    ],
  },
  {
    title: 'Arts & Crafts',
    location: 'Studio B, Hyeameha Training Centre, Accra',
    startTime: '9:00 AM',
    endTime: '12:00 PM',
    duration: '2 hours',
    topics: [
      'Introduction to Various Art Forms and Materials',
      'Hands-On Craft Project (e.g., Making a decorative item)',
      'Kente Weaving',
      'Basket Weaving',
      'Wood carving',
    ],
  },
];

export const DEFAULT_TRAINING_TITLES = DEFAULT_TRAININGS.map(
  (training) => training.title,
);
