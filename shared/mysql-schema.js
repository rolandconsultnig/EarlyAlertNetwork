"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSurveyResponseSchema = exports.insertSurveySchema = exports.insertWebhookSchema = exports.insertApiKeySchema = exports.insertResponsePlanSchema = exports.insertRiskAnalysisSchema = exports.insertRiskIndicatorSchema = exports.insertResponseTeamSchema = exports.insertResponseActivitySchema = exports.insertAlertSchema = exports.insertIncidentReactionSchema = exports.insertIncidentSchema = exports.insertDataSourceSchema = exports.insertUserSchema = exports.surveyResponses = exports.surveys = exports.webhooks = exports.apiKeys = exports.responsePlans = exports.riskAnalyses = exports.riskIndicators = exports.responseTeams = exports.responseActivities = exports.alerts = exports.incidentReactions = exports.incidents = exports.dataSources = exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_zod_1 = require("drizzle-zod");
// Users table
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    username: (0, mysql_core_1.varchar)('username', { length: 255 }).notNull().unique(),
    password: (0, mysql_core_1.varchar)('password', { length: 255 }).notNull(),
    fullName: (0, mysql_core_1.varchar)('full_name', { length: 255 }).notNull(),
    role: (0, mysql_core_1.varchar)('role', { length: 50 }).notNull().default('user'),
    securityLevel: (0, mysql_core_1.int)('security_level').notNull().default(1),
    permissions: (0, mysql_core_1.json)('permissions').$type(),
    department: (0, mysql_core_1.varchar)('department', { length: 100 }),
    position: (0, mysql_core_1.varchar)('position', { length: 100 }),
    phoneNumber: (0, mysql_core_1.varchar)('phone_number', { length: 20 }),
    email: (0, mysql_core_1.varchar)('email', { length: 255 }),
    active: (0, mysql_core_1.int)('active').default(1),
    lastLogin: (0, mysql_core_1.timestamp)('last_login'),
    avatar: (0, mysql_core_1.varchar)('avatar', { length: 255 }),
});
// Data sources table
exports.dataSources = (0, mysql_core_1.mysqlTable)('data_sources', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    type: (0, mysql_core_1.varchar)('type', { length: 50 }).notNull(),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    description: (0, mysql_core_1.text)('description'),
    lastUpdated: (0, mysql_core_1.timestamp)('last_updated').notNull().defaultNow(),
    lastFetchedAt: (0, mysql_core_1.timestamp)('last_fetched_at'),
    apiEndpoint: (0, mysql_core_1.varchar)('api_endpoint', { length: 255 }),
    apiKey: (0, mysql_core_1.varchar)('api_key', { length: 255 }),
    region: (0, mysql_core_1.varchar)('region', { length: 100 }).notNull(),
    frequency: (0, mysql_core_1.varchar)('frequency', { length: 50 }),
    dataFormat: (0, mysql_core_1.varchar)('data_format', { length: 50 }),
    metaData: (0, mysql_core_1.json)('meta_data'),
});
// Incidents table
exports.incidents = (0, mysql_core_1.mysqlTable)('incidents', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description').notNull(),
    location: (0, mysql_core_1.varchar)('location', { length: 255 }).notNull(),
    region: (0, mysql_core_1.varchar)('region', { length: 100 }).notNull(),
    state: (0, mysql_core_1.varchar)('state', { length: 100 }),
    lga: (0, mysql_core_1.varchar)('lga', { length: 100 }),
    severity: (0, mysql_core_1.varchar)('severity', { length: 20 }).notNull().default('medium'),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    reportedAt: (0, mysql_core_1.timestamp)('reported_at').notNull().defaultNow(),
    reportedBy: (0, mysql_core_1.int)('reported_by').notNull(),
    category: (0, mysql_core_1.varchar)('category', { length: 50 }),
    impactedPopulation: (0, mysql_core_1.int)('impacted_population'),
    sourceId: (0, mysql_core_1.int)('source_id'),
    coordinates: (0, mysql_core_1.varchar)('coordinates', { length: 255 }),
    mediaUrls: (0, mysql_core_1.json)('media_urls').$type(),
    verificationStatus: (0, mysql_core_1.varchar)('verification_status', { length: 20 }).notNull().default('pending'),
});
// Incident reactions table
exports.incidentReactions = (0, mysql_core_1.mysqlTable)('incident_reactions', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    incidentId: (0, mysql_core_1.int)('incident_id').notNull(),
    userId: (0, mysql_core_1.int)('user_id').notNull(),
    emoji: (0, mysql_core_1.varchar)('emoji', { length: 20 }).notNull(),
    timestamp: (0, mysql_core_1.timestamp)('timestamp').notNull().defaultNow(),
}, (table) => {
    return {
        userIncidentIdx: (0, mysql_core_1.index)('user_incident_idx').on(table.userId, table.incidentId, table.emoji),
    };
});
// Alerts table
exports.alerts = (0, mysql_core_1.mysqlTable)('alerts', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    message: (0, mysql_core_1.text)('message').notNull(),
    severity: (0, mysql_core_1.varchar)('severity', { length: 20 }).notNull(),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    generatedAt: (0, mysql_core_1.timestamp)('generated_at').notNull().defaultNow(),
    generatedBy: (0, mysql_core_1.int)('generated_by').notNull(),
    sourceType: (0, mysql_core_1.varchar)('source_type', { length: 50 }).notNull(),
    sourceId: (0, mysql_core_1.int)('source_id'),
    sourceCategory: (0, mysql_core_1.varchar)('source_category', { length: 50 }),
    region: (0, mysql_core_1.varchar)('region', { length: 100 }),
    targetGroups: (0, mysql_core_1.json)('target_groups').$type(),
    expiresAt: (0, mysql_core_1.timestamp)('expires_at'),
    actionRequired: (0, mysql_core_1.text)('action_required'),
    responseRequired: (0, mysql_core_1.int)('response_required').default(0),
});
// Response activities table
exports.responseActivities = (0, mysql_core_1.mysqlTable)('response_activities', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description').notNull(),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('planned'),
    startDate: (0, mysql_core_1.timestamp)('start_date').notNull(),
    endDate: (0, mysql_core_1.timestamp)('end_date'),
    responseTeamId: (0, mysql_core_1.int)('response_team_id'),
    alertId: (0, mysql_core_1.int)('alert_id'),
    incidentId: (0, mysql_core_1.int)('incident_id'),
    responsePlanId: (0, mysql_core_1.int)('response_plan_id'),
    region: (0, mysql_core_1.varchar)('region', { length: 100 }).notNull(),
    location: (0, mysql_core_1.varchar)('location', { length: 255 }).notNull(),
    coordinates: (0, mysql_core_1.varchar)('coordinates', { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    createdBy: (0, mysql_core_1.int)('created_by').notNull(),
    outcome: (0, mysql_core_1.text)('outcome'),
    resources: (0, mysql_core_1.json)('resources'),
});
// Response teams table
exports.responseTeams = (0, mysql_core_1.mysqlTable)('response_teams', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    members: (0, mysql_core_1.json)('members').$type(),
    leader: (0, mysql_core_1.int)('leader').notNull(),
    specialty: (0, mysql_core_1.varchar)('specialty', { length: 100 }),
    region: (0, mysql_core_1.varchar)('region', { length: 100 }).notNull(),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    contactInfo: (0, mysql_core_1.json)('contact_info'),
    resourceCapacity: (0, mysql_core_1.json)('resource_capacity'),
});
// Risk indicators table
exports.riskIndicators = (0, mysql_core_1.mysqlTable)('risk_indicators', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    category: (0, mysql_core_1.varchar)('category', { length: 50 }).notNull(),
    severity: (0, mysql_core_1.varchar)('severity', { length: 20 }).notNull(),
    region: (0, mysql_core_1.varchar)('region', { length: 100 }).notNull(),
    sourceId: (0, mysql_core_1.int)('source_id'),
    value: (0, mysql_core_1.int)('value'),
    timestamp: (0, mysql_core_1.timestamp)('timestamp').notNull().defaultNow(),
    trend: (0, mysql_core_1.varchar)('trend', { length: 20 }),
    thresholdLow: (0, mysql_core_1.int)('threshold_low'),
    thresholdMedium: (0, mysql_core_1.int)('threshold_medium'),
    thresholdHigh: (0, mysql_core_1.int)('threshold_high'),
    coordinates: (0, mysql_core_1.varchar)('coordinates', { length: 255 }),
    metaData: (0, mysql_core_1.json)('meta_data'),
});
// Risk analyses table
exports.riskAnalyses = (0, mysql_core_1.mysqlTable)('risk_analyses', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description').notNull(),
    region: (0, mysql_core_1.varchar)('region', { length: 100 }).notNull(),
    location: (0, mysql_core_1.varchar)('location', { length: 255 }).notNull(),
    severity: (0, mysql_core_1.varchar)('severity', { length: 20 }).notNull(),
    relatedIndicators: (0, mysql_core_1.json)('related_indicators').$type(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    analysis: (0, mysql_core_1.text)('analysis').notNull(),
    likelihood: (0, mysql_core_1.varchar)('likelihood', { length: 20 }).notNull(),
    impact: (0, mysql_core_1.varchar)('impact', { length: 20 }).notNull(),
    analyticalMethod: (0, mysql_core_1.varchar)('analytical_method', { length: 100 }),
    confidenceLevel: (0, mysql_core_1.varchar)('confidence_level', { length: 20 }),
    mitigationSuggestions: (0, mysql_core_1.text)('mitigation_suggestions'),
    predictedDevelopment: (0, mysql_core_1.text)('predicted_development'),
    timeframe: (0, mysql_core_1.varchar)('timeframe', { length: 50 }),
});
// Response plans table
exports.responsePlans = (0, mysql_core_1.mysqlTable)('response_plans', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description').notNull(),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('draft'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    createdBy: (0, mysql_core_1.int)('created_by').notNull(),
    lastUpdated: (0, mysql_core_1.timestamp)('last_updated').notNull().defaultNow(),
    riskAnalysisId: (0, mysql_core_1.int)('risk_analysis_id'),
    alertThreshold: (0, mysql_core_1.varchar)('alert_threshold', { length: 20 }),
    approvedBy: (0, mysql_core_1.int)('approved_by'),
    approvedAt: (0, mysql_core_1.timestamp)('approved_at'),
    activities: (0, mysql_core_1.json)('activities').$type(),
    resourceRequirements: (0, mysql_core_1.json)('resource_requirements'),
    contactPoints: (0, mysql_core_1.json)('contact_points'),
    region: (0, mysql_core_1.varchar)('region', { length: 100 }).notNull(),
    interAgencyPortal: (0, mysql_core_1.varchar)('inter_agency_portal', { length: 255 }),
});
// API Keys table
exports.apiKeys = (0, mysql_core_1.mysqlTable)('api_keys', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    key: (0, mysql_core_1.varchar)('key', { length: 255 }).notNull().unique(),
    userId: (0, mysql_core_1.int)('user_id').notNull(),
    permissions: (0, mysql_core_1.json)('permissions').$type(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    expiresAt: (0, mysql_core_1.timestamp)('expires_at'),
    lastUsed: (0, mysql_core_1.timestamp)('last_used'),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    ipRestrictions: (0, mysql_core_1.json)('ip_restrictions').$type(),
});
// Webhooks table
exports.webhooks = (0, mysql_core_1.mysqlTable)('webhooks', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    url: (0, mysql_core_1.varchar)('url', { length: 255 }).notNull(),
    userId: (0, mysql_core_1.int)('user_id').notNull(),
    secret: (0, mysql_core_1.varchar)('secret', { length: 255 }),
    events: (0, mysql_core_1.json)('events').$type(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    lastTriggered: (0, mysql_core_1.timestamp)('last_triggered'),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    headers: (0, mysql_core_1.json)('headers'),
});
// Surveys table
exports.surveys = (0, mysql_core_1.mysqlTable)('surveys', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description').notNull(),
    createdBy: (0, mysql_core_1.int)('created_by').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').notNull().defaultNow(),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('draft'),
    isTemplate: (0, mysql_core_1.int)('is_template').default(0),
    questions: (0, mysql_core_1.json)('questions').$type(),
    targetRegion: (0, mysql_core_1.varchar)('target_region', { length: 100 }),
    category: (0, mysql_core_1.varchar)('category', { length: 50 }),
    distributionMethod: (0, mysql_core_1.varchar)('distribution_method', { length: 50 }),
});
// Survey responses table
exports.surveyResponses = (0, mysql_core_1.mysqlTable)('survey_responses', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    surveyId: (0, mysql_core_1.int)('survey_id').notNull(),
    respondentId: (0, mysql_core_1.int)('respondent_id'),
    submittedAt: (0, mysql_core_1.timestamp)('submitted_at').notNull().defaultNow(),
    location: (0, mysql_core_1.varchar)('location', { length: 255 }),
    region: (0, mysql_core_1.varchar)('region', { length: 100 }),
    coordinates: (0, mysql_core_1.varchar)('coordinates', { length: 255 }),
    answers: (0, mysql_core_1.json)('answers').$type(),
    metaData: (0, mysql_core_1.json)('meta_data'),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({ id: true });
exports.insertDataSourceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dataSources).omit({ id: true });
exports.insertIncidentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.incidents).omit({ id: true });
exports.insertIncidentReactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.incidentReactions).omit({ id: true });
exports.insertAlertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.alerts).omit({ id: true });
exports.insertResponseActivitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.responseActivities).omit({ id: true });
exports.insertResponseTeamSchema = (0, drizzle_zod_1.createInsertSchema)(exports.responseTeams).omit({ id: true });
exports.insertRiskIndicatorSchema = (0, drizzle_zod_1.createInsertSchema)(exports.riskIndicators).omit({ id: true });
exports.insertRiskAnalysisSchema = (0, drizzle_zod_1.createInsertSchema)(exports.riskAnalyses).omit({ id: true });
exports.insertResponsePlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.responsePlans).omit({ id: true });
exports.insertApiKeySchema = (0, drizzle_zod_1.createInsertSchema)(exports.apiKeys).omit({ id: true });
exports.insertWebhookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.webhooks).omit({ id: true });
exports.insertSurveySchema = (0, drizzle_zod_1.createInsertSchema)(exports.surveys).omit({ id: true });
exports.insertSurveyResponseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.surveyResponses).omit({ id: true });
