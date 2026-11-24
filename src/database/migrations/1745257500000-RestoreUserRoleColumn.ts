import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Databases previously run with `synchronize: true` could lose `users.role` (synchronize drops
 * columns missing from the entity, e.g. after checking out an older branch) while
 * AddUserRole1745256100000 stays recorded as applied. Re-adds it if absent; no-op otherwise.
 */
export class RestoreUserRoleColumn1745257500000 implements MigrationInterface {
  name = 'RestoreUserRoleColumn1745257500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" character varying(16) NOT NULL DEFAULT 'user'`,
    );
  }

  public async down(): Promise<void> {
    // Intentionally empty: the column belongs to AddUserRole1745256100000.
  }
}
