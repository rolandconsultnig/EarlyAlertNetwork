import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"), // 'admin', 'analyst', 'responder', 'manager', 'user'
  securityLevel: integer("security_level").notNull().default(1), // Security clearance level from 1 to 7
  permissions: jsonb("permissions").$type<string[]>().default(['view']),
  department: text("department"),
  position: text("position"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  active: boolean("active").default(true),
  lastLogin: timestamp("last_login"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
  securityLevel: true,
  permissions: true,
  department: true,
  position: true,
  phoneNumber: true,
  email: true,
  active: true,
  avatar: true,
});

// 1. Data Collection Module - Data Sources
export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // social_media, news_media, satellite, government_report, ngo_report, sensor_network, field_report
  description: text("description"),
  status: text("status").notNull().default("active"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"),
  region: text("region").notNull().default("Nigeria"),
  frequency: text("frequency"), // hourly, daily, weekly, real-time
  dataFormat: text("data_format"), // json, xml, csv
  metaData: jsonb("meta_data"),
});

export const insertDataSourceSchema = createInsertSchema(dataSources).pick({
  name: true,
  type: true,
  description: true,
  status: true,
  apiEndpoint: true,
  apiKey: true,
  region: true,
  frequency: true,
  dataFormat: true,
  metaData: true,
});

// Collected Data
export const collectedData = pgTable("collected_data", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").notNull(),
  collectedAt: timestamp("collected_at").notNull().defaultNow(),
  content: jsonb("content").notNull(),
  location: text("location"),
  coordinates: jsonb("coordinates"),
  region: text("region").notNull().default("Nigeria"),
  processed: boolean("processed").notNull().default(false),
  sentiment: text("sentiment"),
  keywords: text("keywords").array(),
  mediaUrls: text("media_urls").array(),
});

export const insertCollectedDataSchema = createInsertSchema(collectedData).pick({
  sourceId: true,
  content: true,
  location: true,
  coordinates: true,
  region: true,
  sentiment: true,
  keywords: true,
  mediaUrls: true,
});

// 2. Data Processing Module - Processed Data
export const processedData = pgTable("processed_data", {
  id: serial("id").primaryKey(),
  rawDataId: integer("raw_data_id").notNull(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
  result: jsonb("result").notNull(),
  processingMethod: text("processing_method").notNull(), // nlp, sentiment_analysis, geospatial, entity_extraction
  confidence: integer("confidence"), // 0-100 scale
  relevanceScore: integer("relevance_score"), // 0-100 scale
  entities: jsonb("entities"),
  topics: text("topics").array(),
  normalizedLocation: text("normalized_location"),
  region: text("region").notNull().default("Nigeria"),
});

export const insertProcessedDataSchema = createInsertSchema(processedData).pick({
  rawDataId: true,
  result: true,
  processingMethod: true,
  confidence: true,
  relevanceScore: true,
  entities: true,
  topics: true,
  normalizedLocation: true,
  region: true,
});

// 3. Risk Detection Module - Risk Indicators
export const riskIndicators = pgTable("risk_indicators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // political, economic, environmental, social
  value: integer("value").notNull(), // 0-100 scale
  threshold: integer("threshold").notNull().default(70), // 0-100 scale
  location: text("location").notNull(),
  region: text("region").notNull().default("Nigeria"),
  state: text("state"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sourceId: integer("source_id"),
  dataPointIds: integer("data_point_ids").array(),
  trend: text("trend"), // increasing, decreasing, stable
  confidence: integer("confidence"), // 0-100 scale
  metaData: jsonb("meta_data"),
});

export const insertRiskIndicatorSchema = createInsertSchema(riskIndicators).pick({
  name: true,
  description: true,
  category: true,
  value: true,
  threshold: true,
  location: true,
  region: true,
  state: true,
  sourceId: true,
  dataPointIds: true,
  trend: true,
  confidence: true,
  metaData: true,
});

// Incidents (detected events)
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  region: text("region").notNull().default("Nigeria"),
  state: text("state"),
  lga: text("lga"), // Local Government Area
  severity: text("severity").notNull(), // low, medium, high, critical
  status: text("status").notNull().default("active"),
  reportedAt: timestamp("reported_at").notNull().defaultNow(),
  reportedBy: integer("reported_by").notNull(),
  sourceId: integer("source_id"),
  coordinates: jsonb("coordinates"),
  category: text("category").notNull(), // violence, protest, natural_disaster, economic, political
  relatedIndicators: integer("related_indicators").array(),
  impactedPopulation: integer("impacted_population"),
  mediaUrls: text("media_urls").array(),
  verificationStatus: text("verification_status").notNull().default("unverified"), // unverified, partially_verified, verified
});

export const insertIncidentSchema = createInsertSchema(incidents).pick({
  title: true,
  description: true,
  location: true,
  region: true,
  state: true,
  lga: true,
  severity: true,
  status: true,
  reportedBy: true,
  sourceId: true,
  coordinates: true,
  category: true,
  relatedIndicators: true,
  impactedPopulation: true,
  mediaUrls: true,
  verificationStatus: true,
});

// 4. Risk Assessment - Analyses
export const riskAnalyses = pgTable("risk_analyses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  analysis: text("analysis").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  likelihood: text("likelihood").notNull(), // unlikely, possible, likely, very_likely
  impact: text("impact").notNull(), // minimal, moderate, significant, severe
  region: text("region").notNull().default("Nigeria"),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(),
  relatedIncidents: integer("related_incidents").array(),
  relatedIndicators: integer("related_indicators").array(),
  stakeholders: jsonb("stakeholders"),
  recommendations: text("recommendations").notNull(),
  timeframe: text("timeframe"), // immediate, short_term, medium_term, long_term
});

export const insertRiskAnalysisSchema = createInsertSchema(riskAnalyses).pick({
  title: true,
  description: true,
  analysis: true,
  severity: true,
  likelihood: true,
  impact: true,
  region: true,
  location: true,
  createdBy: true,
  relatedIncidents: true,
  relatedIndicators: true,
  stakeholders: true,
  recommendations: true,
  timeframe: true,
});

// 5. Alert Generation Module - Alerts
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  status: text("status").notNull().default("active"),
  source: text("source").notNull().default("system"), // sms, social_media, phone, app, sos, system
  category: text("category"), // security, health, environment, infrastructure, etc.
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  region: text("region").notNull().default("Nigeria"),
  location: text("location").notNull(),
  incidentId: integer("incident_id"),
  analysisId: integer("analysis_id"),
  recipients: jsonb("recipients"),
  channels: text("channels").array(), // sms, email, app, whatsapp
  escalationLevel: integer("escalation_level").notNull().default(1), // 1-5 scale
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: integer("acknowledged_by"),
  expiresAt: timestamp("expires_at"),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  title: true,
  description: true,
  severity: true,
  status: true,
  source: true,
  category: true,
  region: true,
  location: true,
  incidentId: true,
  analysisId: true,
  recipients: true,
  channels: true,
  escalationLevel: true,
  expiresAt: true,
});

// 6. Response Planning Module - Response Plans
export const responsePlans = pgTable("response_plans", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(),
  alertId: integer("alert_id"),
  incidentId: integer("incident_id"),
  status: text("status").notNull().default("draft"), // draft, approved, active, completed
  category: text("category").notNull(), // evacuation, humanitarian, security, mediation
  region: text("region").notNull().default("Nigeria"),
  location: text("location").notNull(),
  steps: jsonb("steps").notNull(),
  assignedTeams: integer("assigned_teams").array(),
  resources: jsonb("resources"),
  timeline: jsonb("timeline"),
  interAgencyPortal: jsonb("inter_agency_portal"), // Message centers for various agencies
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
});

export const insertResponsePlanSchema = createInsertSchema(responsePlans).pick({
  title: true,
  description: true,
  createdBy: true,
  alertId: true,
  incidentId: true,
  status: true,
  category: true,
  region: true,
  location: true,
  steps: true,
  assignedTeams: true,
  resources: true,
  timeline: true,
  interAgencyPortal: true,
  approvedBy: true,
});

// Response Activities
export const responseActivities = pgTable("response_activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  assignedTeam: integer("assigned_team"),
  assignedUsers: integer("assigned_users").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  alertId: integer("alert_id"),
  incidentId: integer("incident_id"),
  planId: integer("plan_id"),
  region: text("region").notNull().default("Nigeria"),
  location: text("location").notNull(),
  outcome: text("outcome"),
  resources: jsonb("resources"),
  notes: text("notes"),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
});

export const insertResponseActivitySchema = createInsertSchema(responseActivities).pick({
  title: true,
  description: true,
  status: true,
  assignedTeam: true,
  assignedUsers: true,
  startedAt: true,
  alertId: true,
  incidentId: true,
  planId: true,
  region: true,
  location: true,
  outcome: true,
  resources: true,
  notes: true,
  priority: true,
});

// Response Teams
export const responseTeams = pgTable("response_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // medical, security, logistics, assessment, mediation
  status: text("status").notNull().default("active"),
  region: text("region").notNull().default("Nigeria"),
  location: text("location").notNull(),
  capacity: integer("capacity"),
  leader: integer("leader"),
  members: integer("members").array(),
  expertiseAreas: text("expertise_areas").array(),
  equipment: jsonb("equipment"),
  availableFrom: timestamp("available_from"),
  availableTo: timestamp("available_to"),
  contactDetails: jsonb("contact_details"),
});

export const insertResponseTeamSchema = createInsertSchema(responseTeams).pick({
  name: true,
  type: true,
  status: true,
  region: true,
  location: true,
  capacity: true,
  leader: true,
  members: true,
  expertiseAreas: true,
  equipment: true,
  availableFrom: true,
  availableTo: true,
  contactDetails: true,
});

// 7. Monitoring Module - Feedback
export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // response_feedback, system_feedback, alert_feedback
  content: text("content").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  submittedBy: integer("submitted_by").notNull(),
  rating: integer("rating"), // 1-5 scale
  responseId: integer("response_id"),
  alertId: integer("alert_id"),
  incidentId: integer("incident_id"),
  status: text("status").notNull().default("pending"), // pending, reviewed, implemented
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  action: text("action"),
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).pick({
  type: true,
  content: true,
  submittedBy: true,
  rating: true,
  responseId: true,
  alertId: true,
  incidentId: true,
  status: true,
  reviewedBy: true,
  action: true,
});

// 8. Reporting Module - Reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // incident_report, situation_report, analysis_report, feedback_report
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  region: text("region").notNull().default("Nigeria"),
  location: text("location"),
  relatedIncidents: integer("related_incidents").array(),
  relatedResponses: integer("related_responses").array(),
  status: text("status").notNull().default("draft"), // draft, published, archived
  publishedAt: timestamp("published_at"),
  recipients: jsonb("recipients"),
  attachments: jsonb("attachments"),
  tags: text("tags").array(),
});

export const insertReportSchema = createInsertSchema(reports).pick({
  title: true,
  type: true,
  content: true,
  createdBy: true,
  startDate: true,
  endDate: true,
  region: true,
  location: true,
  relatedIncidents: true,
  relatedResponses: true,
  status: true,
  publishedAt: true,
  recipients: true,
  attachments: true,
  tags: true,
});

// 9. Settings and Configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // alert_thresholds, system_config, notification_rules
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  category: true,
  key: true,
  value: true,
  description: true,
  updatedBy: true,
});

// 10. Security Module - Access Logs
export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // login, logout, view, create, update, delete
  resource: text("resource").notNull(), // user, incident, alert, etc.
  resourceId: integer("resource_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  successful: boolean("successful").notNull().default(true),
  details: jsonb("details"),
});

export const insertAccessLogSchema = createInsertSchema(accessLogs).pick({
  userId: true,
  action: true,
  resource: true,
  resourceId: true,
  ipAddress: true,
  userAgent: true,
  successful: true,
  details: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type DataSource = typeof dataSources.$inferSelect;

export type InsertCollectedData = z.infer<typeof insertCollectedDataSchema>;
export type CollectedData = typeof collectedData.$inferSelect;

export type InsertProcessedData = z.infer<typeof insertProcessedDataSchema>;
export type ProcessedData = typeof processedData.$inferSelect;

export type InsertRiskIndicator = z.infer<typeof insertRiskIndicatorSchema>;
export type RiskIndicator = typeof riskIndicators.$inferSelect;

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

export type InsertRiskAnalysis = z.infer<typeof insertRiskAnalysisSchema>;
export type RiskAnalysis = typeof riskAnalyses.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

export type InsertResponsePlan = z.infer<typeof insertResponsePlanSchema>;
export type ResponsePlan = typeof responsePlans.$inferSelect;

export type InsertResponseActivity = z.infer<typeof insertResponseActivitySchema>;
export type ResponseActivity = typeof responseActivities.$inferSelect;

export type InsertResponseTeam = z.infer<typeof insertResponseTeamSchema>;
export type ResponseTeam = typeof responseTeams.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbacks.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;
export type AccessLog = typeof accessLogs.$inferSelect;

// 11. API Integration Module - API Keys
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  permissions: jsonb("permissions").$type<string[]>().notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
  status: text("status").notNull().default("active"),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  userId: true,
  name: true,
  key: true,
  permissions: true,
  expiresAt: true,
  status: true,
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

// 12. Webhook Module - Webhooks
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: jsonb("events").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastTriggered: timestamp("last_triggered"),
  status: text("status").notNull().default("active"),
});

export const insertWebhookSchema = createInsertSchema(webhooks).pick({
  userId: true,
  name: true,
  url: true,
  secret: true,
  events: true,
  status: true,
});

export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;
