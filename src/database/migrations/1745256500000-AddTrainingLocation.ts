import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainingLocation1745256500000 implements MigrationInterface {
  name = 'AddTrainingLocation1745256500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "trainings"
      ADD COLUMN IF NOT EXISTS "location" character varying(255) NOT NULL DEFAULT 'Hyeameha Training Centre, Accra'
    `);
    await queryRunner.query(`
      ALTER TABLE "trainings"
      ALTER COLUMN "location" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trainings" DROP COLUMN "location"`);
  }
}
