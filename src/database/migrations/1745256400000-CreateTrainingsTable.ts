import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainingsTable1745256400000 implements MigrationInterface {
  name = 'CreateTrainingsTable1745256400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "trainings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(255) NOT NULL,
        "location" character varying(255) NOT NULL,
        "start_time" character varying(16) NOT NULL,
        "end_time" character varying(16) NOT NULL,
        "duration" character varying(64) NOT NULL,
        "topics" jsonb NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_by" uuid,
        CONSTRAINT "PK_trainings_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_trainings_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "trainings"`);
  }
}
