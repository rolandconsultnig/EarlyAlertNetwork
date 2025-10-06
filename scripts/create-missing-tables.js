import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function createMissingTables() {
  try {
    console.log('Creating missing tables in Neon database...');
    
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    const sql = neon(databaseUrl);

    // Check which tables exist
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('Existing tables:', existingTables.map(t => t.table_name));

    // Create incidents table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'incidents')) {
      console.log('Creating incidents table...');
      await sql`
        CREATE TABLE "incidents" (
          "id" serial PRIMARY KEY NOT NULL,
          "title" text NOT NULL,
          "description" text NOT NULL,
          "location" text NOT NULL,
          "coordinates" jsonb,
          "severity" text NOT NULL,
          "status" text DEFAULT 'reported' NOT NULL,
          "reported_by" text,
          "assigned_to" text,
          "category" text,
          "tags" text[],
          "metadata" jsonb,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Incidents table created');
    }

    // Create alerts table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'alerts')) {
      console.log('Creating alerts table...');
      await sql`
        CREATE TABLE "alerts" (
          "id" serial PRIMARY KEY NOT NULL,
          "title" text NOT NULL,
          "description" text NOT NULL,
          "severity" text NOT NULL,
          "status" text DEFAULT 'active' NOT NULL,
          "generated_at" timestamp DEFAULT now() NOT NULL,
          "expires_at" timestamp,
          "location" text,
          "coordinates" jsonb,
          "source_category" text,
          "data_source_id" integer,
          "assigned_to" text,
          "priority" text DEFAULT 'medium' NOT NULL,
          "tags" text[],
          "metadata" jsonb,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Alerts table created');
    }

    // Create data_sources table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'data_sources')) {
      console.log('Creating data_sources table...');
      await sql`
        CREATE TABLE "data_sources" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "type" text NOT NULL,
          "description" text,
          "endpoint_url" text,
          "api_key" text,
          "configuration" jsonb,
          "is_active" boolean DEFAULT true NOT NULL,
          "last_sync" timestamp,
          "sync_frequency" text DEFAULT 'hourly',
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Data sources table created');
    }

    // Create response_plans table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'response_plans')) {
      console.log('Creating response_plans table...');
      await sql`
        CREATE TABLE "response_plans" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "description" text,
          "incident_type" text NOT NULL,
          "severity_level" text NOT NULL,
          "steps" jsonb NOT NULL,
          "resources_required" jsonb,
          "estimated_duration" text,
          "inter_agency_portal" text,
          "is_active" boolean DEFAULT true NOT NULL,
          "created_by" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Response plans table created');
    }

    // Create risk_indicators table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'risk_indicators')) {
      console.log('Creating risk_indicators table...');
      await sql`
        CREATE TABLE "risk_indicators" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "description" text,
          "category" text NOT NULL,
          "weight" numeric(3,2) DEFAULT 1.0 NOT NULL,
          "threshold" numeric(10,2),
          "calculation_method" text,
          "data_source_id" integer,
          "is_active" boolean DEFAULT true NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Risk indicators table created');
    }

    // Create response_activities table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'response_activities')) {
      console.log('Creating response_activities table...');
      await sql`
        CREATE TABLE "response_activities" (
          "id" serial PRIMARY KEY NOT NULL,
          "incident_id" integer NOT NULL,
          "activity_type" text NOT NULL,
          "description" text NOT NULL,
          "performed_by" text,
          "timestamp" timestamp DEFAULT now() NOT NULL,
          "status" text DEFAULT 'in_progress' NOT NULL,
          "metadata" jsonb,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Response activities table created');
    }

    // Create response_teams table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'response_teams')) {
      console.log('Creating response_teams table...');
      await sql`
        CREATE TABLE "response_teams" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "description" text,
          "team_lead" text,
          "members" text[],
          "specialization" text,
          "location" text,
          "contact_info" jsonb,
          "is_active" boolean DEFAULT true NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Response teams table created');
    }

    // Create risk_analyses table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'risk_analyses')) {
      console.log('Creating risk_analyses table...');
      await sql`
        CREATE TABLE "risk_analyses" (
          "id" serial PRIMARY KEY NOT NULL,
          "location" text NOT NULL,
          "analysis_date" timestamp DEFAULT now() NOT NULL,
          "risk_score" numeric(5,2) NOT NULL,
          "risk_level" text NOT NULL,
          "indicators" jsonb NOT NULL,
          "recommendations" text[],
          "created_by" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Risk analyses table created');
    }

    // Create api_keys table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'api_keys')) {
      console.log('Creating api_keys table...');
      await sql`
        CREATE TABLE "api_keys" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "key_value" text NOT NULL,
          "service" text NOT NULL,
          "permissions" text[],
          "expires_at" timestamp,
          "is_active" boolean DEFAULT true NOT NULL,
          "created_by" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ API keys table created');
    }

    // Create webhooks table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'webhooks')) {
      console.log('Creating webhooks table...');
      await sql`
        CREATE TABLE "webhooks" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "url" text NOT NULL,
          "events" text[] NOT NULL,
          "secret" text,
          "is_active" boolean DEFAULT true NOT NULL,
          "last_triggered" timestamp,
          "created_by" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Webhooks table created');
    }

    // Create surveys table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'surveys')) {
      console.log('Creating surveys table...');
      await sql`
        CREATE TABLE "surveys" (
          "id" serial PRIMARY KEY NOT NULL,
          "title" text NOT NULL,
          "description" text,
          "questions" jsonb NOT NULL,
          "target_audience" text,
          "is_active" boolean DEFAULT true NOT NULL,
          "created_by" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Surveys table created');
    }

    // Create survey_responses table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'survey_responses')) {
      console.log('Creating survey_responses table...');
      await sql`
        CREATE TABLE "survey_responses" (
          "id" serial PRIMARY KEY NOT NULL,
          "survey_id" integer NOT NULL,
          "respondent_id" text,
          "answers" jsonb NOT NULL,
          "submitted_at" timestamp DEFAULT now() NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Survey responses table created');
    }

    // Create incident_reactions table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'incident_reactions')) {
      console.log('Creating incident_reactions table...');
      await sql`
        CREATE TABLE "incident_reactions" (
          "id" serial PRIMARY KEY NOT NULL,
          "incident_id" integer NOT NULL,
          "user_id" text NOT NULL,
          "reaction_type" text NOT NULL,
          "comment" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Incident reactions table created');
    }

    // Create access_logs table if it doesn't exist
    if (!existingTables.find(t => t.table_name === 'access_logs')) {
      console.log('Creating access_logs table...');
      await sql`
        CREATE TABLE "access_logs" (
          "id" serial PRIMARY KEY NOT NULL,
          "user_id" text NOT NULL,
          "action" text NOT NULL,
          "resource" text NOT NULL,
          "resource_id" integer,
          "timestamp" timestamp DEFAULT now() NOT NULL,
          "ip_address" text,
          "user_agent" text,
          "successful" boolean DEFAULT true NOT NULL,
          "details" jsonb
        )
      `;
      console.log('✅ Access logs table created');
    }

    // Verify all tables were created
    console.log('\nVerifying table creation...');
    const finalTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('\nAll tables in Neon database:');
    finalTables.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    console.log('\n🎉 Neon database setup completed successfully!');
    console.log('All required tables are now available for the Early Alert Network API.');

  } catch (error) {
    console.error('Error setting up Neon database:', error.message);
    process.exit(1);
  }
}

createMissingTables();
