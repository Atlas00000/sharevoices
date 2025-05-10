import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAndProfileTables1709123456789 implements MigrationInterface {
    name = 'CreateUserAndProfileTables1709123456789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create profiles table first (due to foreign key constraint)
        await queryRunner.query(`
            CREATE TABLE "profiles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "bio" text,
                "avatarUrl" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_profiles" PRIMARY KEY ("id")
            )
        `);

        // Create users table with foreign key to profiles
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT 'user',
                "isEmailVerified" boolean NOT NULL DEFAULT false,
                "lastLoginAt" TIMESTAMP,
                "profileId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "REL_users_profile" UNIQUE ("profileId"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id"),
                CONSTRAINT "FK_users_profile" FOREIGN KEY ("profileId") 
                    REFERENCES "profiles"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
    }
} 