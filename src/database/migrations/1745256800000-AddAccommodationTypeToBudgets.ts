import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccommodationTypeToBudgets1745256800000 implements MigrationInterface {
  name = 'AddAccommodationTypeToBudgets1745256800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "accommodation_budgets"
      ADD COLUMN IF NOT EXISTS "accommodation_type" character varying(32)
    `);

    // Legacy tier rows (Standard, Premium, Luxury, VIP) belong to hotel.
    await queryRunner.query(`
      UPDATE "accommodation_budgets"
      SET "accommodation_type" = 'hotel'
      WHERE "accommodation_type" IS NULL
        AND "name" IN ('Standard', 'Premium', 'Luxury', 'VIP')
    `);

    await queryRunner.query(`
      DELETE FROM "accommodation_budgets"
      WHERE "accommodation_type" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "accommodation_budgets"
      ALTER COLUMN "accommodation_type" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "accommodation_budgets"
      DROP COLUMN IF EXISTS "accommodation_type"
    `);
  }
}
