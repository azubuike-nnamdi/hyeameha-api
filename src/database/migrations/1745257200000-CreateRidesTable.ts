import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRidesTable1745257200000 implements MigrationInterface {
  name = 'CreateRidesTable1745257200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "rides" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "vehicle_type" character varying(32) NOT NULL,
        "service_tier" character varying(32) NOT NULL,
        "max_passengers" integer NOT NULL,
        "max_luggage" integer NOT NULL,
        "description" text NOT NULL,
        "image_url" character varying(2048) NOT NULL,
        "price_per_day" numeric(10,2) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_by" uuid,
        CONSTRAINT "PK_rides_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_rides_vehicle_type_service_tier" UNIQUE ("vehicle_type", "service_tier")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "rides"`);
  }
}
