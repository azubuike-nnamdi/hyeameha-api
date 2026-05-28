import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiFailureLogsTable1745256300000 implements MigrationInterface {
  name = 'CreateApiFailureLogsTable1745256300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "api_failure_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tag" character varying(64) NOT NULL,
        "method" character varying(16) NOT NULL,
        "path" character varying(512) NOT NULL,
        "status_code" integer NOT NULL,
        "message" text NOT NULL,
        "response_body" jsonb,
        "request_body" jsonb,
        "user_id" uuid,
        "correlation_id" character varying(64),
        "ip_address" character varying(64),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_api_failure_logs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_api_failure_logs_tag" ON "api_failure_logs" ("tag")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_api_failure_logs_created_at" ON "api_failure_logs" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "api_failure_logs"`);
  }
}
