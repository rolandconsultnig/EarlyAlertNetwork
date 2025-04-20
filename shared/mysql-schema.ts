import { datetime, index, int, json, mysqlEnum, mysqlTable, primaryKey, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  securityLevel: int('security_level').notNull().default(1),
  permissions: json('permissions').$type<string[]>(),
  department: varchar('department', { length: 100 }),
  position: varchar('position', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  email: varchar('email', { length: 255 }),
  active: int('active').default(1),
  lastLogin: timestamp('last_login'),
  avatar: varchar('avatar', { length: 255 }),
});

// Data sources table
export const dataSources = mysqlTable('data_sources', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  description: text('description'),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  lastFetchedAt: timestamp('last_fetched_at'),
  apiEndpoint: varchar('api_endpoint', { length: 255 }),
  apiKey: varchar('api_key', { length: 255 }),
  region: varchar('region', { length: 100 }).notNull(),
  frequency: varchar('frequency', { length: 50 }),
  dataFormat: varchar('data_format', { length: 50 }),
  metaData: json('meta_data'),
});

// Incidents table
export const incidents = mysqlTable('incidents', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  region: varchar('region', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  lga: varchar('lga', { length: 100 }),
  severity: varchar('severity', { length: 20 }).notNull().default('medium'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  reportedAt: timestamp('reported_at').notNull().defaultNow(),
  reportedBy: int('reported_by').notNull(),
  category: varchar('category', { length: 50 }),
  impactedPopulation: int('impacted_population'),
  sourceId: int('source_id'),
  coordinates: varchar('coordinates', { length: 255 }),
  mediaUrls: json('media_urls').$type<string[]>(),
  verificationStatus: varchar('verification_status', { length: 20 }).notNull().default('pending'),
});

// Incident reactions table
export const incidentReactions = mysqlTable('incident_reactions', {
  id: int('id').primaryKey().autoincrement(),
  incidentId: int('incident_id').notNull(),
  userId: int('user_id').notNull(),
  emoji: varchar('emoji', { length: 20 }).notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => {
  return {
    userIncidentIdx: index('user_incident_idx').on(table.userId, table.incidentId, table.emoji),
  };
});

// Alerts table
export const alerts = mysqlTable('alerts', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  generatedAt: timestamp('generated_at').notNull().defaultNow(),
  generatedBy: int('generated_by').notNull(),
  sourceType: varchar('source_type', { length: 50 }).notNull(),
  sourceId: int('source_id'),
  sourceCategory: varchar('source_category', { length: 50 }),
  region: varchar('region', { length: 100 }),
  targetGroups: json('target_groups').$type<string[]>(),
  expiresAt: timestamp('expires_at'),
  actionRequired: text('action_required'),
  responseRequired: int('response_required').default(0),
});

// Response activities table
export const responseActivities = mysqlTable('response_activities', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('planned'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  responseTeamId: int('response_team_id'),
  alertId: int('alert_id'),
  incidentId: int('incident_id'),
  responsePlanId: int('response_plan_id'),
  region: varchar('region', { length: 100 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  coordinates: varchar('coordinates', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: int('created_by').notNull(),
  outcome: text('outcome'),
  resources: json('resources'),
});

// Response teams table
export const responseTeams = mysqlTable('response_teams', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  members: json('members').$type<number[]>(),
  leader: int('leader').notNull(),
  specialty: varchar('specialty', { length: 100 }),
  region: varchar('region', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  contactInfo: json('contact_info'),
  resourceCapacity: json('resource_capacity'),
});

// Risk indicators table
export const riskIndicators = mysqlTable('risk_indicators', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  region: varchar('region', { length: 100 }).notNull(),
  sourceId: int('source_id'),
  value: int('value'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  trend: varchar('trend', { length: 20 }),
  thresholdLow: int('threshold_low'),
  thresholdMedium: int('threshold_medium'),
  thresholdHigh: int('threshold_high'),
  coordinates: varchar('coordinates', { length: 255 }),
  metaData: json('meta_data'),
});

// Risk analyses table
export const riskAnalyses = mysqlTable('risk_analyses', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  region: varchar('region', { length: 100 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  relatedIndicators: json('related_indicators').$type<number[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  analysis: text('analysis').notNull(),
  likelihood: varchar('likelihood', { length: 20 }).notNull(),
  impact: varchar('impact', { length: 20 }).notNull(),
  analyticalMethod: varchar('analytical_method', { length: 100 }),
  confidenceLevel: varchar('confidence_level', { length: 20 }),
  mitigationSuggestions: text('mitigation_suggestions'),
  predictedDevelopment: text('predicted_development'),
  timeframe: varchar('timeframe', { length: 50 }),
});

// Response plans table
export const responsePlans = mysqlTable('response_plans', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: int('created_by').notNull(),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  riskAnalysisId: int('risk_analysis_id'),
  alertThreshold: varchar('alert_threshold', { length: 20 }),
  approvedBy: int('approved_by'),
  approvedAt: timestamp('approved_at'),
  activities: json('activities').$type<any[]>(),
  resourceRequirements: json('resource_requirements'),
  contactPoints: json('contact_points'),
  region: varchar('region', { length: 100 }).notNull(),
  interAgencyPortal: varchar('inter_agency_portal', { length: 255 }),
});

// API Keys table
export const apiKeys = mysqlTable('api_keys', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull(),
  permissions: json('permissions').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
  lastUsed: timestamp('last_used'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  ipRestrictions: json('ip_restrictions').$type<string[]>(),
});

// Webhooks table
export const webhooks = mysqlTable('webhooks', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  userId: int('user_id').notNull(),
  secret: varchar('secret', { length: 255 }),
  events: json('events').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastTriggered: timestamp('last_triggered'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  headers: json('headers'),
});

// Surveys table
export const surveys = mysqlTable('surveys', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  isTemplate: int('is_template').default(0),
  questions: json('questions').$type<SurveyQuestion[]>(),
  targetRegion: varchar('target_region', { length: 100 }),
  category: varchar('category', { length: 50 }),
  distributionMethod: varchar('distribution_method', { length: 50 }),
});

// Survey responses table
export const surveyResponses = mysqlTable('survey_responses', {
  id: int('id').primaryKey().autoincrement(),
  surveyId: int('survey_id').notNull(),
  respondentId: int('respondent_id'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  location: varchar('location', { length: 255 }),
  region: varchar('region', { length: 100 }),
  coordinates: varchar('coordinates', { length: 255 }),
  answers: json('answers').$type<SurveyAnswer[]>(),
  metaData: json('meta_data'),
});

// Types
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;
export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export type DataSource = InferSelectModel<typeof dataSources>;
export type InsertDataSource = InferInsertModel<typeof dataSources>;
export const insertDataSourceSchema = createInsertSchema(dataSources).omit({ id: true });

export type Incident = InferSelectModel<typeof incidents>;
export type InsertIncident = InferInsertModel<typeof incidents>;
export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true });

export type IncidentReaction = InferSelectModel<typeof incidentReactions>;
export type InsertIncidentReaction = InferInsertModel<typeof incidentReactions>;
export const insertIncidentReactionSchema = createInsertSchema(incidentReactions).omit({ id: true });

export type Alert = InferSelectModel<typeof alerts>;
export type InsertAlert = InferInsertModel<typeof alerts>;
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true });

export type ResponseActivity = InferSelectModel<typeof responseActivities>;
export type InsertResponseActivity = InferInsertModel<typeof responseActivities>;
export const insertResponseActivitySchema = createInsertSchema(responseActivities).omit({ id: true });

export type ResponseTeam = InferSelectModel<typeof responseTeams>;
export type InsertResponseTeam = InferInsertModel<typeof responseTeams>;
export const insertResponseTeamSchema = createInsertSchema(responseTeams).omit({ id: true });

export type RiskIndicator = InferSelectModel<typeof riskIndicators>;
export type InsertRiskIndicator = InferInsertModel<typeof riskIndicators>;
export const insertRiskIndicatorSchema = createInsertSchema(riskIndicators).omit({ id: true });

export type RiskAnalysis = InferSelectModel<typeof riskAnalyses>;
export type InsertRiskAnalysis = InferInsertModel<typeof riskAnalyses>;
export const insertRiskAnalysisSchema = createInsertSchema(riskAnalyses).omit({ id: true });

export type ResponsePlan = InferSelectModel<typeof responsePlans>;
export type InsertResponsePlan = InferInsertModel<typeof responsePlans>;
export const insertResponsePlanSchema = createInsertSchema(responsePlans).omit({ id: true });

export type ApiKey = InferSelectModel<typeof apiKeys>;
export type InsertApiKey = InferInsertModel<typeof apiKeys>;
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true });

export type Webhook = InferSelectModel<typeof webhooks>;
export type InsertWebhook = InferInsertModel<typeof webhooks>;
export const insertWebhookSchema = createInsertSchema(webhooks).omit({ id: true });

export type Survey = InferSelectModel<typeof surveys>;
export type InsertSurvey = InferInsertModel<typeof surveys>;
export const insertSurveySchema = createInsertSchema(surveys).omit({ id: true });

export type SurveyResponse = InferSelectModel<typeof surveyResponses>;
export type InsertSurveyResponse = InferInsertModel<typeof surveyResponses>;
export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({ id: true });

// Custom types for JSON fields
export interface SurveyQuestion {
  id: string;
  type: string;
  text: string;
  required: boolean;
  options?: string[];
  helpText?: string;
}

export interface SurveyAnswer {
  questionId: string;
  answer: string | number | string[];
}