import { users, dataSources, incidents, alerts, responseActivities, responseTeams, riskIndicators, riskAnalyses, responsePlans } from "@shared/schema";
import type { 
  User, InsertUser, 
  DataSource, InsertDataSource, 
  Incident, InsertIncident, 
  Alert, InsertAlert, 
  ResponseActivity, InsertResponseActivity, 
  ResponseTeam, InsertResponseTeam, 
  RiskIndicator, InsertRiskIndicator,
  RiskAnalysis, InsertRiskAnalysis,
  ResponsePlan, InsertResponsePlan
} from "@shared/schema";
import session from "express-session";
import { db, pool } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

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
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: number, incident: Partial<Incident>): Promise<Incident>;
  
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
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });

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
    // We need to ensure dates are provided
    if (!insertUser.createdAt) insertUser.createdAt = new Date();
    if (!insertUser.updatedAt) insertUser.updatedAt = new Date();
    
    const [user] = await db.insert(users).values(insertUser).returning();
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

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [newIncident] = await db.insert(incidents).values(incident).returning();
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
    const [newAlert] = await db.insert(alerts).values(alert).returning();
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
    const [newActivity] = await db.insert(responseActivities).values(activity).returning();
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
    const [newTeam] = await db.insert(responseTeams).values(team).returning();
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
    const [newIndicator] = await db.insert(riskIndicators).values(indicator).returning();
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
    const [newAnalysis] = await db.insert(riskAnalyses).values(analysis).returning();
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
    const [newPlan] = await db.insert(responsePlans).values(plan).returning();
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
}

export const storage = new DatabaseStorage();
