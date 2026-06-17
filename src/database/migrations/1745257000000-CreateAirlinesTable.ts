import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAirlinesTable1745257000000 implements MigrationInterface {
  name = 'CreateAirlinesTable1745257000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "airlines" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "code" character varying(8),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_by" uuid,
        CONSTRAINT "PK_airlines_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_airlines_name" UNIQUE ("name")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "airlines"`);
  }
}
