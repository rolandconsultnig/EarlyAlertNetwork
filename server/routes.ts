import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import {
  insertDataSourceSchema,
  insertIncidentSchema,
  insertAlertSchema,
  insertResponseActivitySchema,
  insertResponseTeamSchema,
  insertRiskIndicatorSchema,
  insertRiskAnalysisSchema,
  riskAnalyses
} from "@shared/schema";
import { analysisService } from "./services/analysis-service";
import { db } from "./db";
import { desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // HTTP Server and WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connection
  wss.on('connection', (ws) => {
    // Send active alerts when a client connects
    const sendAlerts = async () => {
      if (ws.readyState === WebSocket.OPEN) {
        const activeAlerts = await storage.getActiveAlerts();
        ws.send(JSON.stringify({ type: 'alerts', data: activeAlerts }));
      }
    };
    
    sendAlerts();
    
    // Set up interval to periodically send updated alerts
    const alertInterval = setInterval(sendAlerts, 30000);
    
    ws.on('close', () => {
      clearInterval(alertInterval);
    });
  });

  // Data Sources API
  app.get("/api/data-sources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sources = await storage.getDataSources();
    res.json(sources);
  });

  app.post("/api/data-sources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertDataSourceSchema.parse(req.body);
      const newSource = await storage.createDataSource(validatedData);
      res.status(201).json(newSource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create data source" });
    }
  });

  app.put("/api/data-sources/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const source = await storage.getDataSource(id);
      
      if (!source) {
        return res.status(404).json({ error: "Data source not found" });
      }
      
      const updatedSource = await storage.updateDataSource(id, req.body);
      res.json(updatedSource);
    } catch (error) {
      res.status(500).json({ error: "Failed to update data source" });
    }
  });

  // Incidents API
  app.get("/api/incidents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const incidents = await storage.getIncidents();
    res.json(incidents);
  });

  app.get("/api/incidents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const incident = await storage.getIncident(id);
      
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incident" });
    }
  });

  app.post("/api/incidents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const newIncident = await storage.createIncident(validatedData);
      res.status(201).json(newIncident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create incident" });
    }
  });

  app.put("/api/incidents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const incident = await storage.getIncident(id);
      
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      
      const updatedIncident = await storage.updateIncident(id, req.body);
      res.json(updatedIncident);
    } catch (error) {
      res.status(500).json({ error: "Failed to update incident" });
    }
  });

  // Alerts API
  app.get("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const alerts = await storage.getAlerts();
    res.json(alerts);
  });

  app.get("/api/alerts/active", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const activeAlerts = await storage.getActiveAlerts();
    res.json(activeAlerts);
  });

  app.get("/api/alerts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.getAlert(id);
      
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alert" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const newAlert = await storage.createAlert(validatedData);
      
      // Notify all connected WebSocket clients about the new alert
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'new-alert', data: newAlert }));
        }
      });
      
      res.status(201).json(newAlert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  app.put("/api/alerts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.getAlert(id);
      
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      const updatedAlert = await storage.updateAlert(id, req.body);
      
      // Notify all connected WebSocket clients about the updated alert
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'updated-alert', data: updatedAlert }));
        }
      });
      
      res.json(updatedAlert);
    } catch (error) {
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  // Response Activities API
  app.get("/api/response-activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const activities = await storage.getResponseActivities();
    res.json(activities);
  });

  app.post("/api/response-activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertResponseActivitySchema.parse(req.body);
      const newActivity = await storage.createResponseActivity(validatedData);
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create response activity" });
    }
  });

  app.put("/api/response-activities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getResponseActivity(id);
      
      if (!activity) {
        return res.status(404).json({ error: "Response activity not found" });
      }
      
      const updatedActivity = await storage.updateResponseActivity(id, req.body);
      res.json(updatedActivity);
    } catch (error) {
      res.status(500).json({ error: "Failed to update response activity" });
    }
  });

  // Response Teams API
  app.get("/api/response-teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const teams = await storage.getResponseTeams();
    res.json(teams);
  });

  app.post("/api/response-teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertResponseTeamSchema.parse(req.body);
      const newTeam = await storage.createResponseTeam(validatedData);
      res.status(201).json(newTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create response team" });
    }
  });

  app.put("/api/response-teams/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const team = await storage.getResponseTeam(id);
      
      if (!team) {
        return res.status(404).json({ error: "Response team not found" });
      }
      
      const updatedTeam = await storage.updateResponseTeam(id, req.body);
      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ error: "Failed to update response team" });
    }
  });

  // Risk Indicators API
  app.get("/api/risk-indicators", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const indicators = await storage.getRiskIndicators();
    res.json(indicators);
  });

  app.get("/api/risk-indicators/time-range", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      const indicators = await storage.getRiskIndicatorsByTimeRange(startDate, endDate);
      res.json(indicators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk indicators" });
    }
  });

  app.post("/api/risk-indicators", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertRiskIndicatorSchema.parse(req.body);
      const newIndicator = await storage.createRiskIndicator(validatedData);
      res.status(201).json(newIndicator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create risk indicator" });
    }
  });

  // Risk Analysis API
  app.get("/api/risk-analyses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const analyses = await db.select().from(riskAnalyses).orderBy(desc(riskAnalyses.id));
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk analyses" });
    }
  });

  app.post("/api/risk-analyses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertRiskAnalysisSchema.parse(req.body);
      const newAnalysis = await storage.createRiskAnalysis(validatedData);
      res.status(201).json(newAnalysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create risk analysis" });
    }
  });

  // AI Analysis API
  app.post("/api/analysis/generate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { region, location } = req.body;
      
      if (!region) {
        return res.status(400).json({ error: "Region is required" });
      }
      
      const result = await analysisService.generateRiskAnalysis(region, location);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      
      // Save the generated analysis to database
      const savedAnalysis = await storage.createRiskAnalysis(result.data);
      
      res.status(201).json(savedAnalysis);
    } catch (error) {
      console.error("Error in generate analysis:", error);
      res.status(500).json({ error: "Failed to generate analysis" });
    }
  });

  app.post("/api/analysis/generate-alert/:analysisId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const analysisId = parseInt(req.params.analysisId);
      
      const result = await analysisService.generateAlerts(analysisId);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      
      // Save the generated alert to database
      const savedAlert = await storage.createAlert(result.data);
      
      // Notify all connected WebSocket clients about the new alert
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'new-alert', data: savedAlert }));
        }
      });
      
      res.status(201).json(savedAlert);
    } catch (error) {
      console.error("Error in generate alert:", error);
      res.status(500).json({ error: "Failed to generate alert" });
    }
  });

  app.post("/api/analysis/incident/:incidentId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const incidentId = parseInt(req.params.incidentId);
      
      const result = await analysisService.analyzeIncident(incidentId);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      
      res.json(result.data);
    } catch (error) {
      console.error("Error in analyze incident:", error);
      res.status(500).json({ error: "Failed to analyze incident" });
    }
  });

  return httpServer;
}
