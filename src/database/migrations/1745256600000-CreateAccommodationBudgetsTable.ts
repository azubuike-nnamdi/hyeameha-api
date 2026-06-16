import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccommodationBudgetsTable1745256600000 implements MigrationInterface {
  name = 'CreateAccommodationBudgetsTable1745256600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "accommodation_budgets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(64) NOT NULL,
        "min_price" numeric(10,2) NOT NULL,
        "max_price" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_by" uuid,
        CONSTRAINT "PK_accommodation_budgets_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_accommodation_budgets_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "accommodation_budgets"`);
  }
}
