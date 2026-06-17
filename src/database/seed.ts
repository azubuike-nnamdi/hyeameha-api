import 'dotenv/config';
import dataSource from './data-source';
import { Event } from '../events/entities/event.entity';
import { AccommodationBudget } from '../accommodation/entities/accommodation-budget.entity';
import { Training } from '../training/entities/training.entity';
import { DEFAULT_ACCOMMODATION_BUDGETS } from './seeds/accommodation-budgets.seed';
import { DEFAULT_EVENTS, DEFAULT_EVENT_TITLES } from './seeds/events.seed';
import {
  DEFAULT_TRAININGS,
  DEFAULT_TRAINING_TITLES,
} from './seeds/trainings.seed';

async function seedEvents(force: boolean): Promise<void> {
  const repo = dataSource.getRepository(Event);
  const count = await repo.count();

  if (count > 0 && !force) {
    console.log(
      `Skipped event seed: ${count} event(s) already exist (use --force to replace default seed rows).`,
    );
    return;
  }

  if (force && count > 0) {
    await repo
      .createQueryBuilder()
      .delete()
      .from(Event)
      .where('title IN (:...titles)', { titles: DEFAULT_EVENT_TITLES })
      .execute();
    console.log('Removed previous default seed events.');
  }

  const rows = DEFAULT_EVENTS.map((row) =>
    repo.create({ ...row, updatedBy: null }),
  );
  await repo.save(rows);
  console.log(`Seeded ${rows.length} local event(s).`);
}

async function seedTrainings(force: boolean): Promise<void> {
  const repo = dataSource.getRepository(Training);
  const count = await repo.count();

  if (count > 0 && !force) {
    console.log(
      `Skipped training seed: ${count} training(s) already exist (use --force to replace default seed rows).`,
    );
    return;
  }

  if (force && count > 0) {
    await repo
      .createQueryBuilder()
      .delete()
      .from(Training)
      .where('title IN (:...titles)', { titles: DEFAULT_TRAINING_TITLES })
      .execute();
    console.log('Removed previous default seed trainings.');
  }

  const rows = DEFAULT_TRAININGS.map((row) =>
    repo.create({ ...row, updatedBy: null }),
  );
  await repo.save(rows);
  console.log(`Seeded ${rows.length} training programme(s).`);
}

async function seedAccommodationBudgets(force: boolean): Promise<void> {
  const repo = dataSource.getRepository(AccommodationBudget);
  const count = await repo.count();

  if (count > 0 && !force) {
    console.log(
      `Skipped accommodation budget seed: ${count} budget(s) already exist (use --force to replace default seed rows).`,
    );
    return;
  }

  if (force && count > 0) {
    for (const row of DEFAULT_ACCOMMODATION_BUDGETS) {
      await repo.delete({
        accommodationType: row.accommodationType,
        name: row.name,
      });
    }
    console.log('Removed previous default seed accommodation budgets.');
  }

  const rows = DEFAULT_ACCOMMODATION_BUDGETS.map((row) =>
    repo.create({ ...row, updatedBy: null }),
  );
  await repo.save(rows);
  console.log(`Seeded ${rows.length} accommodation budget(s).`);
}

async function run(): Promise<void> {
  const force = process.argv.includes('--force');

  await dataSource.initialize();
  try {
    await seedEvents(force);
    await seedTrainings(force);
    await seedAccommodationBudgets(force);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Seed failed: ${message}`);
  process.exit(1);
});
