import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRideBookingsTable1745257300000 implements MigrationInterface {
  name = 'CreateRideBookingsTable1745257300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ride_bookings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booked_by_user_id" uuid NOT NULL,
        "is_booking_for_self" boolean NOT NULL,
        "guest_first_name" character varying(255),
        "guest_last_name" character varying(255),
        "guest_email" character varying(255),
        "guest_phone" character varying(32),
        "pickup_location" character varying(255) NOT NULL,
        "pickup_date" date NOT NULL,
        "pickup_time" character varying(8) NOT NULL,
        "dropoff_location" character varying(255) NOT NULL,
        "ride_id" uuid NOT NULL,
        "number_of_days" integer NOT NULL,
        "passenger_count" integer NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "driver_note" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ride_bookings_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ride_bookings_booked_by" FOREIGN KEY ("booked_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_ride_bookings_ride" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ride_bookings"`);
  }
}
