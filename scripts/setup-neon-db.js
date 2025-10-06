import { Pool } from 'pg';
import 'dotenv/config';

async function setupNeonDatabase() {
  let pool;
  try {
    console.log('Setting up Neon database...');
    
    // Use Neon database URL from environment
    const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL or NEON_DATABASE_URL environment variable is required');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: true
    });

    await pool.query('SELECT 1');
    console.log('✅ Connected to Neon database');

    // Create all required tables
    const createTablesSQL = `
      -- Create incidents table
      CREATE TABLE IF NOT EXISTS "incidents" (
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
      );

      -- Create alerts table
      CREATE TABLE IF NOT EXISTS "alerts" (
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
      );

      -- Create data_sources table
      CREATE TABLE IF NOT EXISTS "data_sources" (
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
      );

      -- Create response_plans table
      CREATE TABLE IF NOT EXISTS "response_plans" (
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
      );

      -- Create risk_indicators table
      CREATE TABLE IF NOT EXISTS "risk_indicators" (
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
      );

      -- Create response_activities table
      CREATE TABLE IF NOT EXISTS "response_activities" (
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
      );

      -- Create response_teams table
      CREATE TABLE IF NOT EXISTS "response_teams" (
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
      );

      -- Create risk_analyses table
      CREATE TABLE IF NOT EXISTS "risk_analyses" (
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
      );

      -- Create api_keys table
      CREATE TABLE IF NOT EXISTS "api_keys" (
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
      );

      -- Create webhooks table
      CREATE TABLE IF NOT EXISTS "webhooks" (
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
      );

      -- Create surveys table
      CREATE TABLE IF NOT EXISTS "surveys" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "questions" jsonb NOT NULL,
        "target_audience" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_by" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );

      -- Create survey_responses table
      CREATE TABLE IF NOT EXISTS "survey_responses" (
        "id" serial PRIMARY KEY NOT NULL,
        "survey_id" integer NOT NULL,
        "respondent_id" text,
        "answers" jsonb NOT NULL,
        "submitted_at" timestamp DEFAULT now() NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );

      -- Create incident_reactions table
      CREATE TABLE IF NOT EXISTS "incident_reactions" (
        "id" serial PRIMARY KEY NOT NULL,
        "incident_id" integer NOT NULL,
        "user_id" text NOT NULL,
        "reaction_type" text NOT NULL,
        "comment" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );

      -- Create access_logs table
      CREATE TABLE IF NOT EXISTS "access_logs" (
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
      );
    `;

    console.log('Creating tables in Neon database...');
    await pool.query(createTablesSQL);
    console.log('✅ All tables created successfully');

    // Create admin user
    console.log('Creating admin user...');
    const { scrypt, randomBytes } = await import("crypto");
    const { promisify } = await import("util");
    const scryptAsync = promisify(scrypt);

    async function hashPassword(password) {
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64));
      return `${buf.toString("hex")}.${salt}`;
    }

    const hashedPassword = await hashPassword("admin123");
    
    await pool.query(`
      INSERT INTO users (id, username, email, first_name, last_name, password_hash, role, access_level, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = now()
    `, [
      'admin-' + Date.now(),
      'admin',
      'admin@ewers4.gov.ng',
      'System',
      'Administrator',
      hashedPassword,
      'admin',
      'level_7',
      true
    ]);

    console.log('✅ Admin user created successfully');
    console.log('Login credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

    // Verify tables were created
    console.log('\nVerifying table creation...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    console.log('\n🎉 Neon database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up Neon database:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('Database connection closed');
    }
  }
}

setupNeonDatabase();
