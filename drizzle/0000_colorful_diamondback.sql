CREATE TYPE "public"."lead_status" AS ENUM('new', 'read', 'replied', 'spam');--> statement-breakpoint
CREATE TYPE "public"."newsletter_source" AS ENUM('footer', 'checklist', 'blog');--> statement-breakpoint
CREATE TYPE "public"."newsletter_status" AS ENUM('pending', 'confirmed', 'unsubscribed');--> statement-breakpoint
CREATE TYPE "public"."budget_range" AS ENUM('lt_5k', '5k_15k', '15k_40k', 'gt_40k', 'not_sure');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('web_app', 'custom_software', 'security', 'consulting', 'other');--> statement-breakpoint
CREATE TYPE "public"."timeline" AS ENUM('asap', '1_3_months', '3_6_months', 'flexible');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"locale" text NOT NULL,
	"ip_hash" text NOT NULL,
	"user_agent" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"privacy_consent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"locale" text NOT NULL,
	"status" "newsletter_status" DEFAULT 'pending' NOT NULL,
	"confirm_token_hash" text,
	"confirm_expires_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"source" "newsletter_source" NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"project_type" "project_type" NOT NULL,
	"services" text[] NOT NULL,
	"budget_range" "budget_range" NOT NULL,
	"timeline" timeline NOT NULL,
	"description" text NOT NULL,
	"locale" text NOT NULL,
	"ip_hash" text NOT NULL,
	"user_agent" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"privacy_consent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"interests" text[] NOT NULL,
	"locale" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "contact_messages_status_created_idx" ON "contact_messages" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "contact_messages_email_idx" ON "contact_messages" USING btree ("email");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quote_requests_status_created_idx" ON "quote_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "quote_requests_email_idx" ON "quote_requests" USING btree ("email");