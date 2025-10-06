"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSurveyResponseSchema = exports.surveyResponses = exports.insertSurveySchema = exports.surveys = exports.insertIncidentReactionSchema = exports.incidentReactions = exports.insertWebhookSchema = exports.webhooks = exports.insertApiKeySchema = exports.apiKeys = exports.insertAccessLogSchema = exports.accessLogs = exports.insertSettingSchema = exports.settings = exports.insertReportSchema = exports.reports = exports.insertFeedbackSchema = exports.feedbacks = exports.insertResponseTeamSchema = exports.responseTeams = exports.insertResponseActivitySchema = exports.responseActivities = exports.insertResponsePlanSchema = exports.responsePlans = exports.insertAlertSchema = exports.alerts = exports.insertRiskAnalysisSchema = exports.riskAnalyses = exports.insertIncidentSchema = exports.incidents = exports.insertRiskIndicatorSchema = exports.riskIndicators = exports.insertProcessedDataSchema = exports.processedData = exports.insertCollectedDataSchema = exports.collectedData = exports.insertDataSourceSchema = exports.dataSources = exports.insertUserSchema = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Users
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    fullName: (0, pg_core_1.text)("full_name").notNull(),
    role: (0, pg_core_1.text)("role").notNull().default("user"), // 'admin', 'analyst', 'responder', 'manager', 'user'
    securityLevel: (0, pg_core_1.integer)("security_level").notNull().default(1), // Security clearance level from 1 to 7
    permissions: (0, pg_core_1.jsonb)("permissions").$type().default(['view']),
    department: (0, pg_core_1.text)("department"),
    position: (0, pg_core_1.text)("position"),
    phoneNumber: (0, pg_core_1.text)("phone_number"),
    email: (0, pg_core_1.text)("email"),
    active: (0, pg_core_1.boolean)("active").default(true),
    lastLogin: (0, pg_core_1.timestamp)("last_login"),
    avatar: (0, pg_core_1.text)("avatar"),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
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
exports.dataSources = (0, pg_core_1.pgTable)("data_sources", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // social_media, news_media, satellite, government_report, ngo_report, sensor_network, field_report
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.text)("status").notNull().default("active"),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").notNull().defaultNow(),
    lastFetchedAt: (0, pg_core_1.timestamp)("last_fetched_at"),
    apiEndpoint: (0, pg_core_1.text)("api_endpoint"),
    apiKey: (0, pg_core_1.text)("api_key"),
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
    frequency: (0, pg_core_1.text)("frequency"), // hourly, daily, weekly, real-time
    dataFormat: (0, pg_core_1.text)("data_format"), // json, xml, csv
    metaData: (0, pg_core_1.jsonb)("meta_data"),
});
exports.insertDataSourceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dataSources).pick({
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
exports.collectedData = (0, pg_core_1.pgTable)("collected_data", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    sourceId: (0, pg_core_1.integer)("source_id").notNull(),
    collectedAt: (0, pg_core_1.timestamp)("collected_at").notNull().defaultNow(),
    content: (0, pg_core_1.jsonb)("content").notNull(),
    location: (0, pg_core_1.text)("location"),
    coordinates: (0, pg_core_1.jsonb)("coordinates"),
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
    processed: (0, pg_core_1.boolean)("processed").notNull().default(false),
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
    status: (0, pg_core_1.text)("status").notNull().default("unprocessed"), // unprocessed, processed, error
    sentiment: (0, pg_core_1.text)("sentiment"),
    keywords: (0, pg_core_1.text)("keywords").array(),
    mediaUrls: (0, pg_core_1.text)("media_urls").array(),
});
exports.insertCollectedDataSchema = (0, drizzle_zod_1.createInsertSchema)(exports.collectedData).pick({
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
exports.processedData = (0, pg_core_1.pgTable)("processed_data", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    rawDataId: (0, pg_core_1.integer)("raw_data_id").notNull(),
    processedAt: (0, pg_core_1.timestamp)("processed_at").notNull().defaultNow(),
    result: (0, pg_core_1.jsonb)("result").notNull(),
    processingMethod: (0, pg_core_1.text)("processing_method").notNull(), // nlp, sentiment_analysis, geospatial, entity_extraction
    confidence: (0, pg_core_1.integer)("confidence"), // 0-100 scale
    relevanceScore: (0, pg_core_1.integer)("relevance_score"), // 0-100 scale
    entities: (0, pg_core_1.jsonb)("entities"),
    topics: (0, pg_core_1.text)("topics").array(),
    normalizedLocation: (0, pg_core_1.text)("normalized_location"),
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
});
exports.insertProcessedDataSchema = (0, drizzle_zod_1.createInsertSchema)(exports.processedData).pick({
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
exports.riskIndicators = (0, pg_core_1.pgTable)("risk_indicators", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.text)("category").notNull(), // political, economic, environmental, social
    value: (0, pg_core_1.integer)("value").notNull(), // 0-100 scale
    threshold: (0, pg_core_1.integer)("threshold").notNull().default(70), // 0-100 scale
    location: (0, pg_core_1.text)("location").notNull(),
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
    state: (0, pg_core_1.text)("state"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull().defaultNow(),
    sourceId: (0, pg_core_1.integer)("source_id"),
    dataPointIds: (0, pg_core_1.integer)("data_point_ids").array(),
    trend: (0, pg_core_1.text)("trend"), // increasing, decreasing, stable
    confidence: (0, pg_core_1.integer)("confidence"), // 0-100 scale
    metaData: (0, pg_core_1.jsonb)("meta_data"),
});
exports.insertRiskIndicatorSchema = (0, drizzle_zod_1.createInsertSchema)(exports.riskIndicators).pick({
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
exports.incidents = (0, pg_core_1.pgTable)("incidents", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    location: (0, pg_core_1.text)("location").notNull(),
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
    state: (0, pg_core_1.text)("state"),
    lga: (0, pg_core_1.text)("lga"), // Local Government Area
    severity: (0, pg_core_1.text)("severity").notNull(), // low, medium, high, critical
    status: (0, pg_core_1.text)("status").notNull().default("active"),
    reportedAt: (0, pg_core_1.timestamp)("reported_at").notNull().defaultNow(),
    reportedBy: (0, pg_core_1.integer)("reported_by").notNull(),
    sourceId: (0, pg_core_1.integer)("source_id"),
    coordinates: (0, pg_core_1.jsonb)("coordinates"),
    category: (0, pg_core_1.text)("category").notNull(), // violence, protest, natural_disaster, economic, political
    relatedIndicators: (0, pg_core_1.integer)("related_indicators").array(),
    impactedPopulation: (0, pg_core_1.integer)("impacted_population"),
    mediaUrls: (0, pg_core_1.text)("media_urls").array(),
    verificationStatus: (0, pg_core_1.text)("verification_status").notNull().default("unverified"), // unverified, partially_verified, verified
});
exports.insertIncidentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.incidents).pick({
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
exports.riskAnalyses = (0, pg_core_1.pgTable)("risk_analyses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    analysis: (0, pg_core_1.text)("analysis").notNull(),
    severity: (0, pg_core_1.text)("severity").notNull(), // low, medium, high, critical
    likelihood: (0, pg_core_1.text)("likelihood").notNull(), // unlikely, possible, likely, very_likely
    impact: (0, pg_core_1.text)("impact").notNull(), // minimal, moderate, significant, severe
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
    location: (0, pg_core_1.text)("location").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    createdBy: (0, pg_core_1.integer)("created_by").notNull(),
    relatedIncidents: (0, pg_core_1.integer)("related_incidents").array(),
    relatedIndicators: (0, pg_core_1.integer)("related_indicators").array(),
    stakeholders: (0, pg_core_1.jsonb)("stakeholders"),
    recommendations: (0, pg_core_1.text)("recommendations").notNull(),
    timeframe: (0, pg_core_1.text)("timeframe"), // immediate, short_term, medium_term, long_term
});
exports.insertRiskAnalysisSchema = (0, drizzle_zod_1.createInsertSchema)(exports.riskAnalyses).pick({
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
exports.alerts = (0, pg_core_1.pgTable)("alerts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    severity: (0, pg_core_1.text)("severity").notNull(), // low, medium, high, critical
    status: (0, pg_core_1.text)("status").notNull().default("active"),
    source: (0, pg_core_1.text)("source").notNull().default("system"), // sms, social_media, phone, app, sos, system
    category: (0, pg_core_1.text)("category"), // security, health, environment, infrastructure, etc.
    generatedAt: (0, pg_core_1.timestamp)("generated_at").notNull().defaultNow(),
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
    location: (0, pg_core_1.text)("location").notNull(),
    incidentId: (0, pg_core_1.integer)("incident_id"),
    analysisId: (0, pg_core_1.integer)("analysis_id"),
    recipients: (0, pg_core_1.jsonb)("recipients"),
    channels: (0, pg_core_1.text)("channels").array(), // sms, email, app, whatsapp
    escalationLevel: (0, pg_core_1.integer)("escalation_level").notNull().default(1), // 1-5 scale
    acknowledgedAt: (0, pg_core_1.timestamp)("acknowledged_at"),
    acknowledgedBy: (0, pg_core_1.integer)("acknowledged_by"),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
});
exports.insertAlertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.alerts).pick({
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
exports.responsePlans = (0, pg_core_1.pgTable)("response_plans", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    createdBy: (0, pg_core_1.integer)("created_by").notNull(),
    alertId: (0, pg_core_1.integer)("alert_id"),
    incidentId: (0, pg_core_1.integer)("incident_id"),
    status: (0, pg_core_1.text)("status").notNull().default("draft"), // draft, approved, active, completed
    category: (0, pg_core_1.text)("category").notNull(), // evacuation, humanitarian, security, mediation
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
    location: (0, pg_core_1.text)("location").notNull(),
    steps: (0, pg_core_1.jsonb)("steps").notNull(),
    assignedTeams: (0, pg_core_1.integer)("assigned_teams").array(),
    resources: (0, pg_core_1.jsonb)("resources"),
    timeline: (0, pg_core_1.jsonb)("timeline"),
    interAgencyPortal: (0, pg_core_1.jsonb)("inter_agency_portal"), // Message centers for various agencies
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow(),
    approvedBy: (0, pg_core_1.integer)("approved_by"),
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
});
exports.insertResponsePlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.responsePlans).pick({
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
exports.responseActivities = (0, pg_core_1.pgTable)("response_activities", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
    assignedTeam: (0, pg_core_1.integer)("assigned_team"),
    assignedUsers: (0, pg_core_1.integer)("assigned_users").array(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    startedAt: (0, pg_core_1.timestamp)("started_at"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    alertId: (0, pg_core_1.integer)("alert_id"),
    incidentId: (0, pg_core_1.integer)("incident_id"),
    planId: (0, pg_core_1.integer)("plan_id"),
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
    location: (0, pg_core_1.text)("location").notNull(),
    outcome: (0, pg_core_1.text)("outcome"),
    resources: (0, pg_core_1.jsonb)("resources"),
    notes: (0, pg_core_1.text)("notes"),
    priority: (0, pg_core_1.text)("priority").notNull().default("medium"), // low, medium, high, urgent
});
exports.insertResponseActivitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.responseActivities).pick({
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
exports.responseTeams = (0, pg_core_1.pgTable)("response_teams", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // medical, security, logistics, assessment, mediation
    status: (0, pg_core_1.text)("status").notNull().default("active"),
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
    location: (0, pg_core_1.text)("location").notNull(),
    capacity: (0, pg_core_1.integer)("capacity"),
    leader: (0, pg_core_1.integer)("leader"),
    members: (0, pg_core_1.integer)("members").array(),
    expertiseAreas: (0, pg_core_1.text)("expertise_areas").array(),
    equipment: (0, pg_core_1.jsonb)("equipment"),
    availableFrom: (0, pg_core_1.timestamp)("available_from"),
    availableTo: (0, pg_core_1.timestamp)("available_to"),
    contactDetails: (0, pg_core_1.jsonb)("contact_details"),
});
exports.insertResponseTeamSchema = (0, drizzle_zod_1.createInsertSchema)(exports.responseTeams).pick({
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
exports.feedbacks = (0, pg_core_1.pgTable)("feedbacks", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    type: (0, pg_core_1.text)("type").notNull(), // response_feedback, system_feedback, alert_feedback
    content: (0, pg_core_1.text)("content").notNull(),
    submittedAt: (0, pg_core_1.timestamp)("submitted_at").notNull().defaultNow(),
    submittedBy: (0, pg_core_1.integer)("submitted_by").notNull(),
    rating: (0, pg_core_1.integer)("rating"), // 1-5 scale
    responseId: (0, pg_core_1.integer)("response_id"),
    alertId: (0, pg_core_1.integer)("alert_id"),
    incidentId: (0, pg_core_1.integer)("incident_id"),
    status: (0, pg_core_1.text)("status").notNull().default("pending"), // pending, reviewed, implemented
    reviewedBy: (0, pg_core_1.integer)("reviewed_by"),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at"),
    action: (0, pg_core_1.text)("action"),
});
exports.insertFeedbackSchema = (0, drizzle_zod_1.createInsertSchema)(exports.feedbacks).pick({
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
exports.reports = (0, pg_core_1.pgTable)("reports", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // incident_report, situation_report, analysis_report, feedback_report
    content: (0, pg_core_1.text)("content").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    createdBy: (0, pg_core_1.integer)("created_by").notNull(),
    startDate: (0, pg_core_1.date)("start_date").notNull(),
    endDate: (0, pg_core_1.date)("end_date").notNull(),
    region: (0, pg_core_1.text)("region").notNull().default("Nigeria"),
    location: (0, pg_core_1.text)("location"),
    relatedIncidents: (0, pg_core_1.integer)("related_incidents").array(),
    relatedResponses: (0, pg_core_1.integer)("related_responses").array(),
    status: (0, pg_core_1.text)("status").notNull().default("draft"), // draft, published, archived
    publishedAt: (0, pg_core_1.timestamp)("published_at"),
    recipients: (0, pg_core_1.jsonb)("recipients"),
    attachments: (0, pg_core_1.jsonb)("attachments"),
    tags: (0, pg_core_1.text)("tags").array(),
});
exports.insertReportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.reports).pick({
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
exports.settings = (0, pg_core_1.pgTable)("settings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    category: (0, pg_core_1.text)("category").notNull(), // alert_thresholds, system_config, notification_rules
    key: (0, pg_core_1.text)("key").notNull(),
    value: (0, pg_core_1.jsonb)("value").notNull(),
    description: (0, pg_core_1.text)("description"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow(),
    updatedBy: (0, pg_core_1.integer)("updated_by").notNull(),
});
exports.insertSettingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.settings).pick({
    category: true,
    key: true,
    value: true,
    description: true,
    updatedBy: true,
});
// 10. Security Module - Access Logs
exports.accessLogs = (0, pg_core_1.pgTable)("access_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    action: (0, pg_core_1.text)("action").notNull(), // login, logout, view, create, update, delete
    resource: (0, pg_core_1.text)("resource").notNull(), // user, incident, alert, etc.
    resourceId: (0, pg_core_1.integer)("resource_id"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull().defaultNow(),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    userAgent: (0, pg_core_1.text)("user_agent"),
    successful: (0, pg_core_1.boolean)("successful").notNull().default(true),
    details: (0, pg_core_1.jsonb)("details"),
});
exports.insertAccessLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.accessLogs).pick({
    userId: true,
    action: true,
    resource: true,
    resourceId: true,
    ipAddress: true,
    userAgent: true,
    successful: true,
    details: true,
});
// 11. API Integration Module - API Keys
exports.apiKeys = (0, pg_core_1.pgTable)("api_keys", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    key: (0, pg_core_1.text)("key").notNull(),
    permissions: (0, pg_core_1.jsonb)("permissions").$type().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    lastUsed: (0, pg_core_1.timestamp)("last_used"),
    status: (0, pg_core_1.text)("status").notNull().default("active"),
});
exports.insertApiKeySchema = (0, drizzle_zod_1.createInsertSchema)(exports.apiKeys).pick({
    userId: true,
    name: true,
    key: true,
    permissions: true,
    expiresAt: true,
    status: true,
});
// 12. Webhook Module - Webhooks
exports.webhooks = (0, pg_core_1.pgTable)("webhooks", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    url: (0, pg_core_1.text)("url").notNull(),
    secret: (0, pg_core_1.text)("secret").notNull(),
    events: (0, pg_core_1.jsonb)("events").$type().notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    lastTriggered: (0, pg_core_1.timestamp)("last_triggered"),
    status: (0, pg_core_1.text)("status").notNull().default("active"),
});
exports.insertWebhookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.webhooks).pick({
    userId: true,
    name: true,
    url: true,
    secret: true,
    events: true,
    status: true,
});
// Emoji Reactions for Incidents
exports.incidentReactions = (0, pg_core_1.pgTable)("incident_reactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    incidentId: (0, pg_core_1.integer)("incident_id").notNull(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    emoji: (0, pg_core_1.text)("emoji").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.insertIncidentReactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.incidentReactions).pick({
    incidentId: true,
    userId: true,
    emoji: true,
});
// Surveys
exports.surveys = (0, pg_core_1.pgTable)("surveys", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    createdBy: (0, pg_core_1.integer)("created_by").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    isTemplate: (0, pg_core_1.boolean)("is_template").notNull().default(false),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    targetRegion: (0, pg_core_1.text)("target_region"),
    targetGroup: (0, pg_core_1.text)("target_group"),
    startDate: (0, pg_core_1.timestamp)("start_date"),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    questions: (0, pg_core_1.jsonb)("questions").$type().notNull(), // Array of question objects
    responsesCount: (0, pg_core_1.integer)("responses_count").notNull().default(0),
});
exports.insertSurveySchema = (0, drizzle_zod_1.createInsertSchema)(exports.surveys).pick({
    title: true,
    description: true,
    createdBy: true,
    isTemplate: true,
    isActive: true,
    targetRegion: true,
    targetGroup: true,
    startDate: true,
    endDate: true,
    questions: true,
});
// Survey Responses
exports.surveyResponses = (0, pg_core_1.pgTable)("survey_responses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    surveyId: (0, pg_core_1.integer)("survey_id").notNull(),
    respondentId: (0, pg_core_1.integer)("respondent_id"),
    respondentName: (0, pg_core_1.text)("respondent_name"),
    respondentContact: (0, pg_core_1.text)("respondent_contact"),
    location: (0, pg_core_1.text)("location"),
    region: (0, pg_core_1.text)("region"),
    coordinates: (0, pg_core_1.jsonb)("coordinates"),
    submittedAt: (0, pg_core_1.timestamp)("submitted_at").defaultNow().notNull(),
    answers: (0, pg_core_1.jsonb)("answers").$type().notNull(), // Array of answer objects
    metaData: (0, pg_core_1.jsonb)("meta_data"), // Additional data like device info, completion time
});
exports.insertSurveyResponseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.surveyResponses).pick({
    surveyId: true,
    respondentId: true,
    respondentName: true,
    respondentContact: true,
    location: true,
    region: true,
    coordinates: true,
    answers: true,
    metaData: true,
});
