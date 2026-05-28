import 'dotenv/config';
import dataSource from './data-source';
import { Event } from '../events/entities/event.entity';
import { DEFAULT_EVENTS, DEFAULT_EVENT_TITLES } from './seeds/events.seed';

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

async function run(): Promise<void> {
  const force = process.argv.includes('--force');

  await dataSource.initialize();
  try {
    await seedEvents(force);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Seed failed: ${message}`);
  process.exit(1);
});
