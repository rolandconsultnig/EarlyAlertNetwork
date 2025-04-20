import { 
  users, dataSources, incidents, incidentReactions, 
  alerts, responseActivities, responseTeams, 
  riskIndicators, riskAnalyses, responsePlans, 
  apiKeys, webhooks, surveys, surveyResponses
} from "@shared/schema";
import type { 
  User, InsertUser, 
  DataSource, InsertDataSource, 
  Incident, InsertIncident,
  IncidentReaction, InsertIncidentReaction,
  Alert, InsertAlert, 
  ResponseActivity, InsertResponseActivity, 
  ResponseTeam, InsertResponseTeam, 
  RiskIndicator, InsertRiskIndicator,
  RiskAnalysis, InsertRiskAnalysis,
  ResponsePlan, InsertResponsePlan,
  ApiKey, InsertApiKey,
  Webhook, InsertWebhook,
  Survey, InsertSurvey,
  SurveyResponse, InsertSurveyResponse
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import crypto from "crypto";
import MySQLStore from "express-mysql-session";

// MySQL session store setup
const sessionStoreOptions = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: 3306,
  user: process.env.MYSQL_USER || 'admin',
  password: process.env.MYSQL_PASSWORD || '$admin123321nimda@',
  database: process.env.MYSQL_DATABASE || 'ipcr-new',
  // Additional options for session table
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
};

// Create MySQL session store
const MySQLSessionStore = MySQLStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  // Data source methods
  getDataSources(): Promise<DataSource[]>;
  getDataSource(id: number): Promise<DataSource | undefined>;
  createDataSource(source: InsertDataSource): Promise<DataSource>;
  updateDataSource(id: number, source: Partial<DataSource>): Promise<DataSource>;
  
  // Incident methods
  getIncidents(): Promise<Incident[]>;
  getIncident(id: number): Promise<Incident | undefined>;
  getIncidentsByTitle(title: string): Promise<Incident[]>;
  getIncidentsByRegion(region: string): Promise<Incident[]>;
  getIncidentsByLocation(lat: number, lng: number, radiusKm?: number): Promise<Incident[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: number, incident: Partial<Incident>): Promise<Incident>;
  deleteIncident(id: number): Promise<boolean>;
  
  // Incident reactions methods
  getIncidentReactions(incidentId: number): Promise<IncidentReaction[]>;
  getUserIncidentReaction(incidentId: number, userId: number, emoji: string): Promise<IncidentReaction | undefined>;
  createIncidentReaction(reaction: InsertIncidentReaction): Promise<IncidentReaction>;
  deleteIncidentReaction(id: number): Promise<boolean>;
  
  // Alert methods
  getAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<Alert>): Promise<Alert>;
  
  // Response activity methods
  getResponseActivities(): Promise<ResponseActivity[]>;
  getResponseActivity(id: number): Promise<ResponseActivity | undefined>;
  createResponseActivity(activity: InsertResponseActivity): Promise<ResponseActivity>;
  updateResponseActivity(id: number, activity: Partial<ResponseActivity>): Promise<ResponseActivity>;
  
  // Response team methods
  getResponseTeams(): Promise<ResponseTeam[]>;
  getResponseTeam(id: number): Promise<ResponseTeam | undefined>;
  createResponseTeam(team: InsertResponseTeam): Promise<ResponseTeam>;
  updateResponseTeam(id: number, team: Partial<ResponseTeam>): Promise<ResponseTeam>;
  
  // Risk indicator methods
  getRiskIndicators(): Promise<RiskIndicator[]>;
  getRiskIndicator(id: number): Promise<RiskIndicator | undefined>;
  createRiskIndicator(indicator: InsertRiskIndicator): Promise<RiskIndicator>;
  updateRiskIndicator(id: number, indicator: Partial<RiskIndicator>): Promise<RiskIndicator>;
  getRiskIndicatorsByTimeRange(startDate: Date, endDate: Date): Promise<RiskIndicator[]>;
  
  // Risk analysis methods
  getRiskAnalyses(): Promise<RiskAnalysis[]>;
  getRiskAnalysis(id: number): Promise<RiskAnalysis | undefined>;
  createRiskAnalysis(analysis: InsertRiskAnalysis): Promise<RiskAnalysis>;
  updateRiskAnalysis(id: number, analysis: Partial<RiskAnalysis>): Promise<RiskAnalysis>;
  
  // Response plan methods
  getResponsePlans(): Promise<ResponsePlan[]>;
  getResponsePlan(id: number): Promise<ResponsePlan | undefined>;
  createResponsePlan(plan: InsertResponsePlan): Promise<ResponsePlan>;
  updateResponsePlan(id: number, plan: Partial<ResponsePlan>): Promise<ResponsePlan>;
  
  // API keys methods
  getApiKeys(userId?: number): Promise<ApiKey[]>;
  getApiKey(id: number): Promise<ApiKey | undefined>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, apiKey: Partial<ApiKey>): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<boolean>;
  
  // Webhook methods
  getWebhooks(userId?: number): Promise<Webhook[]>;
  getWebhook(id: number): Promise<Webhook | undefined>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: number, webhook: Partial<Webhook>): Promise<Webhook>;
  deleteWebhook(id: number): Promise<boolean>;
  updateWebhookLastTriggered(id: number): Promise<Webhook>;

  // Survey methods
  getSurveys(): Promise<Survey[]>;
  getSurveyTemplates(): Promise<Survey[]>;
  getSurvey(id: number): Promise<Survey | undefined>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  updateSurvey(id: number, survey: Partial<Survey>): Promise<Survey>;
  deleteSurvey(id: number): Promise<boolean>;
  
  // Survey response methods
  getSurveyResponses(surveyId: number): Promise<SurveyResponse[]>;
  getSurveyResponse(id: number): Promise<SurveyResponse | undefined>;
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MySQLSessionStore(sessionStoreOptions);

    // Initialize default data if needed - would be done through migrations
    // this.initializeDefaultData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.id));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values([insertUser]).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  // Data source methods
  async getDataSources(): Promise<DataSource[]> {
    return db.select().from(dataSources);
  }

  async getDataSource(id: number): Promise<DataSource | undefined> {
    const [dataSource] = await db.select().from(dataSources).where(eq(dataSources.id, id));
    return dataSource;
  }

  async createDataSource(source: InsertDataSource): Promise<DataSource> {
    const [dataSource] = await db.insert(dataSources).values(source).returning();
    return dataSource;
  }

  async updateDataSource(id: number, sourceData: Partial<DataSource>): Promise<DataSource> {
    const [updatedSource] = await db
      .update(dataSources)
      .set(sourceData)
      .where(eq(dataSources.id, id))
      .returning();
    
    if (!updatedSource) {
      throw new Error(`Data source with id ${id} not found`);
    }
    
    return updatedSource;
  }

  // Incident methods
  async getIncidents(): Promise<Incident[]> {
    return db.select().from(incidents).orderBy(desc(incidents.reportedAt));
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async getIncidentsByTitle(title: string): Promise<Incident[]> {
    const matchingIncidents = await db.select().from(incidents).where(eq(incidents.title, title));
    return matchingIncidents;
  }
  
  async getIncidentsByRegion(region: string): Promise<Incident[]> {
    const regionIncidents = await db.select().from(incidents).where(eq(incidents.region, region));
    return regionIncidents;
  }
  
  async getIncidentsByLocation(lat: number, lng: number, radiusKm: number = 5): Promise<Incident[]> {
    // Get all incidents
    const allIncidents = await db.select().from(incidents);
    
    // Filter incidents within the radius
    const nearbyIncidents = allIncidents.filter(incident => {
      if (!incident.location) return false;
      
      try {
        const [incLat, incLng] = incident.location.split(',').map(coord => parseFloat(coord.trim()));
        if (isNaN(incLat) || isNaN(incLng)) return false;
        
        // Calculate distance using haversine formula
        const earthRadiusKm = 6371;
        const dLat = this.degreesToRadians(incLat - lat);
        const dLng = this.degreesToRadians(incLng - lng);
        
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(this.degreesToRadians(lat)) * Math.cos(this.degreesToRadians(incLat)) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = earthRadiusKm * c;
        
        return distance <= radiusKm;
      } catch (e) {
        return false;
      }
    });
    
    return nearbyIncidents;
  }
  
  private degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [newIncident] = await db.insert(incidents).values([incident]).returning();
    return newIncident;
  }

  async updateIncident(id: number, incidentData: Partial<Incident>): Promise<Incident> {
    const [updatedIncident] = await db
      .update(incidents)
      .set(incidentData)
      .where(eq(incidents.id, id))
      .returning();
    
    if (!updatedIncident) {
      throw new Error(`Incident with id ${id} not found`);
    }
    
    return updatedIncident;
  }
  
  async deleteIncident(id: number): Promise<boolean> {
    const result = await db
      .delete(incidents)
      .where(eq(incidents.id, id))
      .returning();
    return result.length > 0;
  }
  
  // Incident reactions methods
  async getIncidentReactions(incidentId: number): Promise<IncidentReaction[]> {
    return db
      .select()
      .from(incidentReactions)
      .where(eq(incidentReactions.incidentId, incidentId));
  }
  
  async getUserIncidentReaction(incidentId: number, userId: number, emoji: string): Promise<IncidentReaction | undefined> {
    const [reaction] = await db
      .select()
      .from(incidentReactions)
      .where(
        and(
          eq(incidentReactions.incidentId, incidentId),
          eq(incidentReactions.userId, userId),
          eq(incidentReactions.emoji, emoji)
        )
      );
    return reaction;
  }
  
  async createIncidentReaction(reaction: InsertIncidentReaction): Promise<IncidentReaction> {
    const [newReaction] = await db
      .insert(incidentReactions)
      .values([reaction])
      .returning();
    return newReaction;
  }
  
  async deleteIncidentReaction(id: number): Promise<boolean> {
    const result = await db
      .delete(incidentReactions)
      .where(eq(incidentReactions.id, id))
      .returning();
    return result.length > 0;
  }

  // Alert methods
  async getAlerts(): Promise<Alert[]> {
    return db.select().from(alerts).orderBy(desc(alerts.generatedAt));
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return db
      .select()
      .from(alerts)
      .where(eq(alerts.status, 'active'))
      .orderBy(desc(alerts.generatedAt));
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values([alert]).returning();
    return newAlert;
  }

  async updateAlert(id: number, alertData: Partial<Alert>): Promise<Alert> {
    const [updatedAlert] = await db
      .update(alerts)
      .set(alertData)
      .where(eq(alerts.id, id))
      .returning();
    
    if (!updatedAlert) {
      throw new Error(`Alert with id ${id} not found`);
    }
    
    return updatedAlert;
  }

  // Response activity methods
  async getResponseActivities(): Promise<ResponseActivity[]> {
    return db.select().from(responseActivities).orderBy(desc(responseActivities.createdAt));
  }

  async getResponseActivity(id: number): Promise<ResponseActivity | undefined> {
    const [activity] = await db.select().from(responseActivities).where(eq(responseActivities.id, id));
    return activity;
  }

  async createResponseActivity(activity: InsertResponseActivity): Promise<ResponseActivity> {
    const [newActivity] = await db.insert(responseActivities).values([activity]).returning();
    return newActivity;
  }

  async updateResponseActivity(id: number, activityData: Partial<ResponseActivity>): Promise<ResponseActivity> {
    const [updatedActivity] = await db
      .update(responseActivities)
      .set(activityData)
      .where(eq(responseActivities.id, id))
      .returning();
    
    if (!updatedActivity) {
      throw new Error(`Response activity with id ${id} not found`);
    }
    
    return updatedActivity;
  }

  // Response team methods
  async getResponseTeams(): Promise<ResponseTeam[]> {
    return db.select().from(responseTeams);
  }

  async getResponseTeam(id: number): Promise<ResponseTeam | undefined> {
    const [team] = await db.select().from(responseTeams).where(eq(responseTeams.id, id));
    return team;
  }

  async createResponseTeam(team: InsertResponseTeam): Promise<ResponseTeam> {
    const [newTeam] = await db.insert(responseTeams).values([team]).returning();
    return newTeam;
  }

  async updateResponseTeam(id: number, teamData: Partial<ResponseTeam>): Promise<ResponseTeam> {
    const [updatedTeam] = await db
      .update(responseTeams)
      .set(teamData)
      .where(eq(responseTeams.id, id))
      .returning();
    
    if (!updatedTeam) {
      throw new Error(`Response team with id ${id} not found`);
    }
    
    return updatedTeam;
  }

  // Risk indicator methods
  async getRiskIndicators(): Promise<RiskIndicator[]> {
    return db.select().from(riskIndicators).orderBy(desc(riskIndicators.timestamp));
  }

  async getRiskIndicator(id: number): Promise<RiskIndicator | undefined> {
    const [indicator] = await db.select().from(riskIndicators).where(eq(riskIndicators.id, id));
    return indicator;
  }

  async createRiskIndicator(indicator: InsertRiskIndicator): Promise<RiskIndicator> {
    const [newIndicator] = await db.insert(riskIndicators).values([indicator]).returning();
    return newIndicator;
  }

  async updateRiskIndicator(id: number, indicatorData: Partial<RiskIndicator>): Promise<RiskIndicator> {
    const [updatedIndicator] = await db
      .update(riskIndicators)
      .set(indicatorData)
      .where(eq(riskIndicators.id, id))
      .returning();
    
    if (!updatedIndicator) {
      throw new Error(`Risk indicator with id ${id} not found`);
    }
    
    return updatedIndicator;
  }

  async getRiskIndicatorsByTimeRange(startDate: Date, endDate: Date): Promise<RiskIndicator[]> {
    return db
      .select()
      .from(riskIndicators)
      .where(
        and(
          gte(riskIndicators.timestamp, startDate),
          lte(riskIndicators.timestamp, endDate)
        )
      )
      .orderBy(desc(riskIndicators.timestamp));
  }

  // Risk analysis methods
  async getRiskAnalyses(): Promise<RiskAnalysis[]> {
    return db.select().from(riskAnalyses).orderBy(desc(riskAnalyses.createdAt));
  }

  async getRiskAnalysis(id: number): Promise<RiskAnalysis | undefined> {
    const [analysis] = await db.select().from(riskAnalyses).where(eq(riskAnalyses.id, id));
    return analysis;
  }

  async createRiskAnalysis(analysis: InsertRiskAnalysis): Promise<RiskAnalysis> {
    const [newAnalysis] = await db.insert(riskAnalyses).values([analysis]).returning();
    return newAnalysis;
  }

  async updateRiskAnalysis(id: number, analysisData: Partial<RiskAnalysis>): Promise<RiskAnalysis> {
    const [updatedAnalysis] = await db
      .update(riskAnalyses)
      .set(analysisData)
      .where(eq(riskAnalyses.id, id))
      .returning();
    
    if (!updatedAnalysis) {
      throw new Error(`Risk analysis with id ${id} not found`);
    }
    
    return updatedAnalysis;
  }
  
  // Response Plan methods
  async getResponsePlans(): Promise<ResponsePlan[]> {
    return db.select().from(responsePlans).orderBy(desc(responsePlans.createdAt));
  }

  async getResponsePlan(id: number): Promise<ResponsePlan | undefined> {
    const [plan] = await db.select().from(responsePlans).where(eq(responsePlans.id, id));
    return plan;
  }

  async createResponsePlan(plan: InsertResponsePlan): Promise<ResponsePlan> {
    const [newPlan] = await db.insert(responsePlans).values([plan]).returning();
    return newPlan;
  }

  async updateResponsePlan(id: number, planData: Partial<ResponsePlan>): Promise<ResponsePlan> {
    const [updatedPlan] = await db
      .update(responsePlans)
      .set(planData)
      .where(eq(responsePlans.id, id))
      .returning();
    
    if (!updatedPlan) {
      throw new Error(`Response plan with id ${id} not found`);
    }
    
    return updatedPlan;
  }

  // API Key methods
  async getApiKeys(userId?: number): Promise<ApiKey[]> {
    if (userId) {
      return db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
    }
    return db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
  }

  async getApiKey(id: number): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return apiKey;
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey;
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [newApiKey] = await db.insert(apiKeys).values([apiKey]).returning();
    return newApiKey;
  }

  async updateApiKey(id: number, apiKeyData: Partial<ApiKey>): Promise<ApiKey> {
    const [updatedApiKey] = await db
      .update(apiKeys)
      .set(apiKeyData)
      .where(eq(apiKeys.id, id))
      .returning();
    
    if (!updatedApiKey) {
      throw new Error(`API key with id ${id} not found`);
    }
    
    return updatedApiKey;
  }

  async deleteApiKey(id: number): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return true;
  }

  // Webhook methods
  async getWebhooks(userId?: number): Promise<Webhook[]> {
    if (userId) {
      return db.select().from(webhooks).where(eq(webhooks.userId, userId)).orderBy(desc(webhooks.createdAt));
    }
    return db.select().from(webhooks).orderBy(desc(webhooks.createdAt));
  }

  async getWebhook(id: number): Promise<Webhook | undefined> {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook;
  }

  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const [newWebhook] = await db.insert(webhooks).values([webhook]).returning();
    return newWebhook;
  }

  async updateWebhook(id: number, webhookData: Partial<Webhook>): Promise<Webhook> {
    const [updatedWebhook] = await db
      .update(webhooks)
      .set(webhookData)
      .where(eq(webhooks.id, id))
      .returning();
    
    if (!updatedWebhook) {
      throw new Error(`Webhook with id ${id} not found`);
    }
    
    return updatedWebhook;
  }

  async deleteWebhook(id: number): Promise<boolean> {
    const result = await db.delete(webhooks).where(eq(webhooks.id, id));
    return true;
  }

  async updateWebhookLastTriggered(id: number): Promise<Webhook> {
    const [updatedWebhook] = await db
      .update(webhooks)
      .set({ lastTriggered: new Date() })
      .where(eq(webhooks.id, id))
      .returning();
    
    if (!updatedWebhook) {
      throw new Error(`Webhook with id ${id} not found`);
    }
    
    return updatedWebhook;
  }

  // Survey methods
  async getSurveys(): Promise<Survey[]> {
    return db.select().from(surveys).orderBy(desc(surveys.createdAt));
  }

  async getSurveyTemplates(): Promise<Survey[]> {
    return db
      .select()
      .from(surveys)
      .where(eq(surveys.isTemplate, true))
      .orderBy(desc(surveys.createdAt));
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey;
  }

  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    // Ensure questions have unique IDs
    const surveyCopy = { ...survey };
    if (Array.isArray(surveyCopy.questions)) {
      surveyCopy.questions = surveyCopy.questions.map((q: any) => ({
        ...q,
        id: q.id || crypto.randomUUID()
      }));
    }

    const [newSurvey] = await db.insert(surveys).values([surveyCopy]).returning();
    return newSurvey;
  }

  async updateSurvey(id: number, surveyData: Partial<Survey>): Promise<Survey> {
    const [updatedSurvey] = await db
      .update(surveys)
      .set({
        ...surveyData,
        updatedAt: new Date()
      })
      .where(eq(surveys.id, id))
      .returning();
    
    if (!updatedSurvey) {
      throw new Error(`Survey with id ${id} not found`);
    }
    
    return updatedSurvey;
  }

  async deleteSurvey(id: number): Promise<boolean> {
    const result = await db
      .delete(surveys)
      .where(eq(surveys.id, id))
      .returning();
    return result.length > 0;
  }

  // Survey response methods
  async getSurveyResponses(surveyId: number): Promise<SurveyResponse[]> {
    return db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId))
      .orderBy(desc(surveyResponses.submittedAt));
  }

  async getSurveyResponse(id: number): Promise<SurveyResponse | undefined> {
    const [response] = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.id, id));
    return response;
  }

  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    const [newResponse] = await db
      .insert(surveyResponses)
      .values([response])
      .returning();
    
    // Update the responses count on the survey
    await db
      .update(surveys)
      .set({ 
        responsesCount: sql`${surveys.responsesCount} + 1` 
      })
      .where(eq(surveys.id, response.surveyId));
    
    return newResponse;
  }
}

export const storage = new DatabaseStorage();
