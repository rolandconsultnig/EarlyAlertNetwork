import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
  avatar: true,
});

// Data Sources
export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertDataSourceSchema = createInsertSchema(dataSources).pick({
  name: true,
  type: true,
  status: true,
});

// Incidents
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("active"),
  reportedAt: timestamp("reported_at").notNull().defaultNow(),
  reportedBy: integer("reported_by").notNull(),
  sourceId: integer("source_id"),
  coordinates: jsonb("coordinates"),
});

export const insertIncidentSchema = createInsertSchema(incidents).pick({
  title: true,
  description: true,
  location: true,
  severity: true,
  status: true,
  reportedBy: true,
  sourceId: true,
  coordinates: true,
});

// Alerts
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("active"),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  incidentId: integer("incident_id"),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  title: true,
  description: true,
  severity: true,
  status: true,
  incidentId: true,
});

// Response Activities
export const responseActivities = pgTable("response_activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  assignedTeam: text("assigned_team"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  alertId: integer("alert_id"),
  incidentId: integer("incident_id"),
});

export const insertResponseActivitySchema = createInsertSchema(responseActivities).pick({
  title: true,
  description: true,
  status: true,
  assignedTeam: true,
  alertId: true,
  incidentId: true,
});

// Response Teams
export const responseTeams = pgTable("response_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  location: text("location"),
  capacity: integer("capacity"),
});

export const insertResponseTeamSchema = createInsertSchema(responseTeams).pick({
  name: true,
  type: true,
  status: true,
  location: true,
  capacity: true,
});

// Risk Indicators
export const riskIndicators = pgTable("risk_indicators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  value: integer("value").notNull(),
  location: text("location").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sourceId: integer("source_id"),
  type: text("type").notNull(),
});

export const insertRiskIndicatorSchema = createInsertSchema(riskIndicators).pick({
  name: true,
  description: true,
  value: true,
  location: true,
  sourceId: true,
  type: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type DataSource = typeof dataSources.$inferSelect;

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

export type InsertResponseActivity = z.infer<typeof insertResponseActivitySchema>;
export type ResponseActivity = typeof responseActivities.$inferSelect;

export type InsertResponseTeam = z.infer<typeof insertResponseTeamSchema>;
export type ResponseTeam = typeof responseTeams.$inferSelect;

export type InsertRiskIndicator = z.infer<typeof insertRiskIndicatorSchema>;
export type RiskIndicator = typeof riskIndicators.$inferSelect;
