import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetOtpsTable1745256200000 implements MigrationInterface {
  name = 'CreatePasswordResetOtpsTable1745256200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "password_reset_otps" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "email" character varying(255) NOT NULL,
        "otp_hash" character varying(255) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_otps_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_password_reset_otps_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_password_reset_otps_email" ON "password_reset_otps" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "password_reset_otps"`);
  }
}
