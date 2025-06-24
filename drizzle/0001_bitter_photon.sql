CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"user_name" text NOT NULL,
	"user_image_src" text DEFAULT '/mascot.svg' NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"permissions" text[] DEFAULT '{}' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	CONSTRAINT "admins_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"user_name" text DEFAULT 'User' NOT NULL,
	"user_image_src" text DEFAULT '/mascot.svg' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
