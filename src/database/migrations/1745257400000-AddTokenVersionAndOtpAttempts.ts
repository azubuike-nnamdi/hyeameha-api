import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * - users.token_version: bumped on password change/reset and account deletion; JWTs carry it
 *   and are rejected once it changes.
 * - password_reset_otps.attempts: failed verification count; code discarded at the limit.
 */
export class AddTokenVersionAndOtpAttempts1745257400000 implements MigrationInterface {
  name = 'AddTokenVersionAndOtpAttempts1745257400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_otps" ADD COLUMN IF NOT EXISTS "attempts" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_email_lower" ON "users" (LOWER("email"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_api_failure_logs_created_at" ON "api_failure_logs" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_api_failure_logs_created_at"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email_lower"`);
    await queryRunner.query(
      `ALTER TABLE "password_reset_otps" DROP COLUMN "attempts"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "token_version"`);
  }
}
