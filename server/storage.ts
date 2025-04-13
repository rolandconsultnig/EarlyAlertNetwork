import { users, dataSources, incidents, alerts, responseActivities, responseTeams, riskIndicators } from "@shared/schema";
import type { 
  User, InsertUser, 
  DataSource, InsertDataSource, 
  Incident, InsertIncident, 
  Alert, InsertAlert, 
  ResponseActivity, InsertResponseActivity, 
  ResponseTeam, InsertResponseTeam, 
  RiskIndicator, InsertRiskIndicator 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dataSources: Map<number, DataSource>;
  private incidents: Map<number, Incident>;
  private alerts: Map<number, Alert>;
  private responseActivities: Map<number, ResponseActivity>;
  private responseTeams: Map<number, ResponseTeam>;
  private riskIndicators: Map<number, RiskIndicator>;
  
  sessionStore: session.SessionStore;
  
  // ID counters
  private userIdCounter: number;
  private dataSourceIdCounter: number;
  private incidentIdCounter: number;
  private alertIdCounter: number;
  private responseActivityIdCounter: number;
  private responseTeamIdCounter: number;
  private riskIndicatorIdCounter: number;

  constructor() {
    this.users = new Map();
    this.dataSources = new Map();
    this.incidents = new Map();
    this.alerts = new Map();
    this.responseActivities = new Map();
    this.responseTeams = new Map();
    this.riskIndicators = new Map();
    
    this.userIdCounter = 1;
    this.dataSourceIdCounter = 1;
    this.incidentIdCounter = 1;
    this.alertIdCounter = 1;
    this.responseActivityIdCounter = 1;
    this.responseTeamIdCounter = 1;
    this.riskIndicatorIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  // Default data initialization
  private initializeDefaultData() {
    // Initialize data sources
    const dataSourceTypes = ['Field Reports', 'News Aggregation', 'Social Media Monitor', 'Satellite Imagery', 'SMS Reports'];
    const dataSourceStatuses = ['active', 'active', 'degraded', 'active', 'offline'];
    
    dataSourceTypes.forEach((name, index) => {
      this.createDataSource({
        name,
        type: name.toLowerCase().replace(/\s/g, '_'),
        status: dataSourceStatuses[index]
      });
    });
    
    // Initialize response teams
    const teamNames = ['Health Response Team', 'Mediation Unit', 'Security Team', 'Logistics Team'];
    const teamTypes = ['medical', 'mediation', 'security', 'logistics'];
    const locations = ['Northern Province', 'Eastern District', 'Capital Region', 'Southern Region'];
    
    teamNames.forEach((name, index) => {
      this.createResponseTeam({
        name,
        type: teamTypes[index],
        status: 'active',
        location: locations[index],
        capacity: 10 + index * 5
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Data source methods
  async getDataSources(): Promise<DataSource[]> {
    return Array.from(this.dataSources.values());
  }

  async getDataSource(id: number): Promise<DataSource | undefined> {
    return this.dataSources.get(id);
  }

  async createDataSource(source: InsertDataSource): Promise<DataSource> {
    const id = this.dataSourceIdCounter++;
    const now = new Date();
    const dataSource: DataSource = { ...source, id, lastUpdated: now };
    this.dataSources.set(id, dataSource);
    return dataSource;
  }

  async updateDataSource(id: number, sourceData: Partial<DataSource>): Promise<DataSource> {
    const source = await this.getDataSource(id);
    if (!source) {
      throw new Error(`Data source with id ${id} not found`);
    }
    
    const updatedSource = { ...source, ...sourceData };
    this.dataSources.set(id, updatedSource);
    return updatedSource;
  }

  // Incident methods
  async getIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values());
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const id = this.incidentIdCounter++;
    const now = new Date();
    const newIncident: Incident = { ...incident, id, reportedAt: now };
    this.incidents.set(id, newIncident);
    return newIncident;
  }

  async updateIncident(id: number, incidentData: Partial<Incident>): Promise<Incident> {
    const incident = await this.getIncident(id);
    if (!incident) {
      throw new Error(`Incident with id ${id} not found`);
    }
    
    const updatedIncident = { ...incident, ...incidentData };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  // Alert methods
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => alert.status === 'active');
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.alertIdCounter++;
    const now = new Date();
    const newAlert: Alert = { ...alert, id, generatedAt: now };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: number, alertData: Partial<Alert>): Promise<Alert> {
    const alert = await this.getAlert(id);
    if (!alert) {
      throw new Error(`Alert with id ${id} not found`);
    }
    
    const updatedAlert = { ...alert, ...alertData };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Response activity methods
  async getResponseActivities(): Promise<ResponseActivity[]> {
    return Array.from(this.responseActivities.values());
  }

  async getResponseActivity(id: number): Promise<ResponseActivity | undefined> {
    return this.responseActivities.get(id);
  }

  async createResponseActivity(activity: InsertResponseActivity): Promise<ResponseActivity> {
    const id = this.responseActivityIdCounter++;
    const now = new Date();
    const newActivity: ResponseActivity = { ...activity, id, createdAt: now, completedAt: null };
    this.responseActivities.set(id, newActivity);
    return newActivity;
  }

  async updateResponseActivity(id: number, activityData: Partial<ResponseActivity>): Promise<ResponseActivity> {
    const activity = await this.getResponseActivity(id);
    if (!activity) {
      throw new Error(`Response activity with id ${id} not found`);
    }
    
    const updatedActivity = { ...activity, ...activityData };
    this.responseActivities.set(id, updatedActivity);
    return updatedActivity;
  }

  // Response team methods
  async getResponseTeams(): Promise<ResponseTeam[]> {
    return Array.from(this.responseTeams.values());
  }

  async getResponseTeam(id: number): Promise<ResponseTeam | undefined> {
    return this.responseTeams.get(id);
  }

  async createResponseTeam(team: InsertResponseTeam): Promise<ResponseTeam> {
    const id = this.responseTeamIdCounter++;
    const newTeam: ResponseTeam = { ...team, id };
    this.responseTeams.set(id, newTeam);
    return newTeam;
  }

  async updateResponseTeam(id: number, teamData: Partial<ResponseTeam>): Promise<ResponseTeam> {
    const team = await this.getResponseTeam(id);
    if (!team) {
      throw new Error(`Response team with id ${id} not found`);
    }
    
    const updatedTeam = { ...team, ...teamData };
    this.responseTeams.set(id, updatedTeam);
    return updatedTeam;
  }

  // Risk indicator methods
  async getRiskIndicators(): Promise<RiskIndicator[]> {
    return Array.from(this.riskIndicators.values());
  }

  async getRiskIndicator(id: number): Promise<RiskIndicator | undefined> {
    return this.riskIndicators.get(id);
  }

  async createRiskIndicator(indicator: InsertRiskIndicator): Promise<RiskIndicator> {
    const id = this.riskIndicatorIdCounter++;
    const now = new Date();
    const newIndicator: RiskIndicator = { ...indicator, id, timestamp: now };
    this.riskIndicators.set(id, newIndicator);
    return newIndicator;
  }

  async updateRiskIndicator(id: number, indicatorData: Partial<RiskIndicator>): Promise<RiskIndicator> {
    const indicator = await this.getRiskIndicator(id);
    if (!indicator) {
      throw new Error(`Risk indicator with id ${id} not found`);
    }
    
    const updatedIndicator = { ...indicator, ...indicatorData };
    this.riskIndicators.set(id, updatedIndicator);
    return updatedIndicator;
  }

  async getRiskIndicatorsByTimeRange(startDate: Date, endDate: Date): Promise<RiskIndicator[]> {
    return Array.from(this.riskIndicators.values()).filter(
      indicator => indicator.timestamp >= startDate && indicator.timestamp <= endDate
    );
  }
}

export const storage = new MemStorage();
