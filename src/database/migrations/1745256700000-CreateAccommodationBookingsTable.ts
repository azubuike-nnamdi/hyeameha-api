import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccommodationBookingsTable1745256700000 implements MigrationInterface {
  name = 'CreateAccommodationBookingsTable1745256700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "accommodation_bookings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booked_by_user_id" uuid NOT NULL,
        "is_booking_for_self" boolean NOT NULL,
        "guest_first_name" character varying(255),
        "guest_last_name" character varying(255),
        "guest_email" character varying(255),
        "guest_phone" character varying(32),
        "accommodation_type" character varying(64) NOT NULL,
        "budget_id" uuid NOT NULL,
        "location" character varying(255) NOT NULL,
        "check_in_date" date NOT NULL,
        "check_in_time" character varying(8) NOT NULL,
        "check_out_date" date NOT NULL,
        "number_of_days" integer NOT NULL,
        "additional_info" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_accommodation_bookings_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_accommodation_bookings_booked_by" FOREIGN KEY ("booked_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_accommodation_bookings_budget" FOREIGN KEY ("budget_id") REFERENCES "accommodation_budgets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "accommodation_bookings"`);
  }
}
