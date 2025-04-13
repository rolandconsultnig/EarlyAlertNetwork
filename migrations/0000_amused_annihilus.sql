CREATE TABLE "access_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"successful" boolean DEFAULT true NOT NULL,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"severity" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"region" text DEFAULT 'Nigeria' NOT NULL,
	"location" text NOT NULL,
	"incident_id" integer,
	"analysis_id" integer,
	"recipients" jsonb,
	"channels" text[],
	"escalation_level" integer DEFAULT 1 NOT NULL,
	"acknowledged_at" timestamp,
	"acknowledged_by" integer,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "collected_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"collected_at" timestamp DEFAULT now() NOT NULL,
	"content" jsonb NOT NULL,
	"location" text,
	"coordinates" jsonb,
	"region" text DEFAULT 'Nigeria' NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"sentiment" text,
	"keywords" text[],
	"media_urls" text[]
);
--> statement-breakpoint
CREATE TABLE "data_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"api_endpoint" text,
	"api_key" text,
	"region" text DEFAULT 'Nigeria' NOT NULL,
	"frequency" text,
	"data_format" text,
	"meta_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"submitted_by" integer NOT NULL,
	"rating" integer,
	"response_id" integer,
	"alert_id" integer,
	"incident_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"action" text
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"region" text DEFAULT 'Nigeria' NOT NULL,
	"state" text,
	"lga" text,
	"severity" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"reported_at" timestamp DEFAULT now() NOT NULL,
	"reported_by" integer NOT NULL,
	"source_id" integer,
	"coordinates" jsonb,
	"category" text NOT NULL,
	"related_indicators" integer[],
	"impacted_population" integer,
	"media_urls" text[],
	"verification_status" text DEFAULT 'unverified' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processed_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"raw_data_id" integer NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	"result" jsonb NOT NULL,
	"processing_method" text NOT NULL,
	"confidence" integer,
	"relevance_score" integer,
	"entities" jsonb,
	"topics" text[],
	"normalized_location" text,
	"region" text DEFAULT 'Nigeria' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"region" text DEFAULT 'Nigeria' NOT NULL,
	"location" text,
	"related_incidents" integer[],
	"related_responses" integer[],
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"recipients" jsonb,
	"attachments" jsonb,
	"tags" text[]
);
--> statement-breakpoint
CREATE TABLE "response_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"assigned_team" integer,
	"assigned_users" integer[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"alert_id" integer,
	"incident_id" integer,
	"plan_id" integer,
	"region" text DEFAULT 'Nigeria' NOT NULL,
	"location" text NOT NULL,
	"outcome" text,
	"resources" jsonb,
	"notes" text,
	"priority" text DEFAULT 'medium' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "response_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer NOT NULL,
	"alert_id" integer,
	"incident_id" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"category" text NOT NULL,
	"region" text DEFAULT 'Nigeria' NOT NULL,
	"location" text NOT NULL,
	"steps" jsonb NOT NULL,
	"assigned_teams" integer[],
	"resources" jsonb,
	"timeline" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"approved_by" integer,
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "response_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"region" text DEFAULT 'Nigeria' NOT NULL,
	"location" text NOT NULL,
	"capacity" integer,
	"leader" integer,
	"members" integer[],
	"expertise_areas" text[],
	"equipment" jsonb,
	"available_from" timestamp,
	"available_to" timestamp,
	"contact_details" jsonb
);
--> statement-breakpoint
CREATE TABLE "risk_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"analysis" text NOT NULL,
	"severity" text NOT NULL,
	"likelihood" text NOT NULL,
	"impact" text NOT NULL,
	"region" text DEFAULT 'Nigeria' NOT NULL,
	"location" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer NOT NULL,
	"related_incidents" integer[],
	"related_indicators" integer[],
	"stakeholders" jsonb,
	"recommendations" text NOT NULL,
	"timeframe" text
);
--> statement-breakpoint
CREATE TABLE "risk_indicators" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"value" integer NOT NULL,
	"threshold" integer DEFAULT 70 NOT NULL,
	"location" text NOT NULL,
	"region" text DEFAULT 'Nigeria' NOT NULL,
	"state" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"source_id" integer,
	"data_point_ids" integer[],
	"trend" text,
	"confidence" integer,
	"meta_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"avatar" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
