import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowMultipleBudgetsPerAccommodationType1745256900000 implements MigrationInterface {
  name = 'AllowMultipleBudgetsPerAccommodationType1745256900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_accommodation_budgets_accommodation_type"
    `);

    await queryRunner.query(`
      ALTER TABLE "accommodation_budgets"
      ALTER COLUMN "max_price" DROP NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_accommodation_budgets_type_and_name"
      ON "accommodation_budgets" ("accommodation_type", "name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_accommodation_budgets_type_and_name"
    `);

    await queryRunner.query(`
      UPDATE "accommodation_budgets"
      SET "max_price" = "min_price"
      WHERE "max_price" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "accommodation_budgets"
      ALTER COLUMN "max_price" SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_accommodation_budgets_accommodation_type"
      ON "accommodation_budgets" ("accommodation_type")
    `);
  }
}
