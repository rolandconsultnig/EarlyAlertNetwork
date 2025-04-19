import type { Express, Request, Response, NextFunction } from "express";
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
  insertResponsePlanSchema,
  insertApiKeySchema,
  insertWebhookSchema,
  riskAnalyses
} from "@shared/schema";
import { analysisService } from "./services/analysis-service";
import { nlpService } from "./services/nlp-service";
import { apiIntegrationService } from "./services/api-integration-service";
import { dataSourceService } from "./services/data-source-service";
import { registerIntegrationRoutes } from "./services/integrations/integration-routes";
import { integrationServices } from "./services/integrations";
import { db } from "./db";
import { desc, eq, count } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Health check endpoint for AWS deployment
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0"
    });
  });

  // HTTP Server and WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Register integration routes (Twilio, Twitter, Facebook, Instagram)
  registerIntegrationRoutes(app);

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
      // Add debug logging
      console.log("Received incident payload:", JSON.stringify(req.body, null, 2));
      
      const validatedData = insertIncidentSchema.parse(req.body);
      const newIncident = await storage.createIncident(validatedData);
      res.status(201).json(newIncident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: error.errors });
      }
      console.error("Failed to create incident:", error);
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

  // Public incident reporting endpoint - does not require authentication
  app.post("/api/public/incidents", async (req, res) => {
    try {
      console.log("Received public incident payload:", JSON.stringify(req.body, null, 2));
      
      // Extract the necessary incident data from the request
      const { 
        title, description, location, region, actorType, actorName,
        contactName, contactEmail, contactPhone
      } = req.body;

      // Format the data to match the incident schema
      const incidentData = {
        title,
        description,
        location, // Use the provided location
        region,
        severity: "medium", // Default severity for public reports
        status: "pending", // Incidents from public start as pending
        category: "conflict", // Default category
        reportedBy: 1, // Default to admin user ID (1) for public reports
        coordinates: JSON.stringify({
          lat: 0, // These will be updated by admins during verification 
          lng: 0,
          address: location
        }),
        verificationStatus: "unverified",
        // Add any other required fields with sensible defaults
        impactedPopulation: 0,
        // Store the reporter contact info and actor information in the metadata
        mediaUrls: []
      };

      // Add the incident to the database
      const incident = await storage.createIncident(incidentData);
      
      // Update the incident with additional JSON metadata that doesn't fit the schema
      await storage.updateIncident(incident.id, {
        coordinates: JSON.stringify({
          ...JSON.parse(incident.coordinates as string),
          reporterInfo: {
            name: contactName,
            email: contactEmail || "",
            phone: contactPhone
          },
          actors: {
            type: actorType,
            name: actorName
          }
        })
      });

      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating public incident:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: error.errors });
      }
      res.status(400).json({ error: "Failed to create incident", details: (error as Error).message });
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
  
  // Response Plans API
  app.get("/api/response-plans", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const plans = await storage.getResponsePlans();
    res.json(plans);
  });

  app.get("/api/response-plans/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getResponsePlan(id);
      
      if (!plan) {
        return res.status(404).json({ error: "Response plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch response plan" });
    }
  });

  app.post("/api/response-plans", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertResponsePlanSchema.parse(req.body);
      const newPlan = await storage.createResponsePlan(validatedData);
      res.status(201).json(newPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create response plan" });
    }
  });

  app.put("/api/response-plans/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getResponsePlan(id);
      
      if (!plan) {
        return res.status(404).json({ error: "Response plan not found" });
      }
      
      const updatedPlan = await storage.updateResponsePlan(id, req.body);
      res.json(updatedPlan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update response plan" });
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
      // Ensure data exists and convert field names if needed to match schema
      if (!result.data) {
        return res.status(500).json({ error: "Analysis data generation failed" });
      }
      
      const analysisData = {
        title: result.data.title,
        description: result.data.description,
        location: result.data.location,
        severity: result.data.severity,
        likelihood: result.data.likelihood,
        impact: result.data.impact,
        analysis: result.data.analysis,
        createdBy: result.data.createdBy,
        recommendations: result.data.recommendations,
        timeframe: result.data.timeframe,
        region: result.data.region,
      };
      
      const savedAnalysis = await storage.createRiskAnalysis(analysisData);
      
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
      // Ensure data exists and convert field names if needed to match schema
      if (!result.data) {
        return res.status(500).json({ error: "Alert data generation failed" });
      }
      
      const alertData = {
        title: result.data.title,
        description: result.data.description,
        location: result.data.location,
        severity: result.data.severity,
        status: result.data.status,
        region: result.data.region,
        incidentId: result.data.incidentId,
        escalationLevel: result.data.escalationLevel,
        channels: result.data.channels
      };
      
      const savedAlert = await storage.createAlert(alertData);
      
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

  // NLP API Endpoints
  app.post("/api/nlp/sentiment", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required and must be a string" });
      }
      
      const result = nlpService.analyzeSentiment(text);
      res.json(result);
    } catch (error) {
      console.error("Error in sentiment analysis:", error);
      res.status(500).json({ error: "Failed to analyze sentiment" });
    }
  });
  
  app.post("/api/nlp/keywords", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { text, maxResults } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required and must be a string" });
      }
      
      const limit = maxResults && !isNaN(maxResults) ? parseInt(maxResults) : 10;
      const result = nlpService.extractKeywords(text, limit);
      res.json(result);
    } catch (error) {
      console.error("Error in keyword extraction:", error);
      res.status(500).json({ error: "Failed to extract keywords" });
    }
  });
  
  app.post("/api/nlp/classify", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { text, maxResults } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required and must be a string" });
      }
      
      const limit = maxResults && !isNaN(maxResults) ? parseInt(maxResults) : 3;
      const result = nlpService.classifyText(text, limit);
      res.json(result);
    } catch (error) {
      console.error("Error in text classification:", error);
      res.status(500).json({ error: "Failed to classify text" });
    }
  });
  
  app.post("/api/nlp/summarize", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { text, maxLength } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required and must be a string" });
      }
      
      const limit = maxLength && !isNaN(maxLength) ? parseInt(maxLength) : 200;
      const result = nlpService.summarizeText(text, limit);
      res.json({ summary: result });
    } catch (error) {
      console.error("Error in text summarization:", error);
      res.status(500).json({ error: "Failed to summarize text" });
    }
  });
  
  app.post("/api/nlp/entities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required and must be a string" });
      }
      
      const result = nlpService.extractEntities(text);
      res.json(result);
    } catch (error) {
      console.error("Error in entity extraction:", error);
      res.status(500).json({ error: "Failed to extract entities" });
    }
  });

  // API Integration - API Keys
  app.get("/api/integration/api-keys", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let apiKeys;
      // Admin users can see all API keys, others only see their own
      if (req.user?.role === 'admin') {
        apiKeys = await storage.getApiKeys();
      } else {
        apiKeys = await storage.getApiKeys(req.user?.id);
      }
      res.json(apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.get("/api/integration/api-keys/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const apiKey = await storage.getApiKey(id);
      
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      // Only allow access to own API keys unless admin
      if (apiKey.userId !== req.user?.id && req.user?.role !== 'admin') {
        return res.sendStatus(403);
      }
      
      res.json(apiKey);
    } catch (error) {
      console.error("Error fetching API key:", error);
      res.status(500).json({ error: "Failed to fetch API key" });
    }
  });

  app.post("/api/integration/api-keys", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { name, permissions, expiresAt } = req.body;
      
      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ error: "Name and permissions array are required" });
      }
      
      const newApiKey = await apiIntegrationService.createApiKey(
        req.user?.id,
        name,
        permissions,
        expiresAt ? new Date(expiresAt) : undefined
      );
      
      res.status(201).json(newApiKey);
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  app.put("/api/integration/api-keys/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const apiKey = await storage.getApiKey(id);
      
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      // Only allow access to own API keys unless admin
      if (apiKey.userId !== req.user?.id && req.user?.role !== 'admin') {
        return res.sendStatus(403);
      }
      
      const updatedApiKey = await storage.updateApiKey(id, req.body);
      res.json(updatedApiKey);
    } catch (error) {
      console.error("Error updating API key:", error);
      res.status(500).json({ error: "Failed to update API key" });
    }
  });

  app.delete("/api/integration/api-keys/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const apiKey = await storage.getApiKey(id);
      
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      // Only allow access to own API keys unless admin
      if (apiKey.userId !== req.user?.id && req.user?.role !== 'admin') {
        return res.sendStatus(403);
      }
      
      await storage.deleteApiKey(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ error: "Failed to delete API key" });
    }
  });

  // API Integration - Webhooks
  app.get("/api/integration/webhooks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let webhooks;
      // Admin users can see all webhooks, others only see their own
      if (req.user?.role === 'admin') {
        webhooks = await storage.getWebhooks();
      } else {
        webhooks = await storage.getWebhooks(req.user?.id);
      }
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ error: "Failed to fetch webhooks" });
    }
  });

  app.get("/api/integration/webhooks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const webhook = await storage.getWebhook(id);
      
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      // Only allow access to own webhooks unless admin
      if (webhook.userId !== req.user?.id && req.user?.role !== 'admin') {
        return res.sendStatus(403);
      }
      
      res.json(webhook);
    } catch (error) {
      console.error("Error fetching webhook:", error);
      res.status(500).json({ error: "Failed to fetch webhook" });
    }
  });

  app.post("/api/integration/webhooks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { name, url, events } = req.body;
      
      if (!name || !url || !events || !Array.isArray(events)) {
        return res.status(400).json({ error: "Name, URL, and events array are required" });
      }
      
      const webhook = await apiIntegrationService.createWebhook(
        req.user?.id,
        name,
        url,
        events
      );
      
      res.status(201).json(webhook);
    } catch (error) {
      console.error("Error creating webhook:", error);
      res.status(500).json({ error: "Failed to create webhook" });
    }
  });

  app.put("/api/integration/webhooks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const webhook = await storage.getWebhook(id);
      
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      // Only allow access to own webhooks unless admin
      if (webhook.userId !== req.user?.id && req.user?.role !== 'admin') {
        return res.sendStatus(403);
      }
      
      const updatedWebhook = await storage.updateWebhook(id, req.body);
      res.json(updatedWebhook);
    } catch (error) {
      console.error("Error updating webhook:", error);
      res.status(500).json({ error: "Failed to update webhook" });
    }
  });

  app.delete("/api/integration/webhooks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const webhook = await storage.getWebhook(id);
      
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      // Only allow access to own webhooks unless admin
      if (webhook.userId !== req.user?.id && req.user?.role !== 'admin') {
        return res.sendStatus(403);
      }
      
      await storage.deleteWebhook(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting webhook:", error);
      res.status(500).json({ error: "Failed to delete webhook" });
    }
  });

  // External API access middleware
  const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
    // Check if request is already authenticated via session
    if (req.isAuthenticated()) {
      return next();
    }
    
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }
    
    // Determine the required permission based on the endpoint and method
    let requiredPermission = 'read';
    
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      requiredPermission = 'write';
    }
    
    // Check some endpoints that require specific permissions
    if (req.path.includes('/admin')) {
      requiredPermission = 'admin';
    }
    
    // Validate API key
    const isValid = await apiIntegrationService.validateApiKey(apiKey, requiredPermission);
    
    if (!isValid) {
      return res.status(403).json({ error: "Invalid or expired API key" });
    }
    
    next();
  };
  
  // External API routes (accessible with API key)
  app.use('/api/external', apiKeyAuth);
  
  app.get('/api/external/incidents', async (req, res) => {
    try {
      const incidents = await storage.getIncidents();
      
      // Send webhook event for this API access
      await apiIntegrationService.triggerWebhooks('api.incidents.accessed', {
        timestamp: new Date(),
        endpoint: '/api/external/incidents',
        method: 'GET'
      });
      
      res.json(incidents);
    } catch (error) {
      console.error("Error in external incidents API:", error);
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  });

  app.get('/api/external/alerts', async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      
      // Send webhook event for this API access
      await apiIntegrationService.triggerWebhooks('api.alerts.accessed', {
        timestamp: new Date(),
        endpoint: '/api/external/alerts',
        method: 'GET'
      });
      
      res.json(alerts);
    } catch (error) {
      console.error("Error in external alerts API:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Data Collection API
  app.post("/api/data-sources/fetch-all", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get all active sources
      const sources = await storage.getDataSources();
      const activeSources = sources.filter(source => source.status === 'active');
      
      // Start fetching data from all active sources
      await dataSourceService.fetchFromAllSources();
      
      // Process the collected data
      await dataSourceService.processCollectedData();
      
      res.status(200).json({ 
        success: true, 
        message: "Data fetch initiated from all active sources",
        sourcesCount: activeSources.length
      });
    } catch (error) {
      console.error("Error fetching data from sources:", error);
      res.status(500).json({ success: false, error: "Failed to fetch data from sources" });
    }
  });
  

  
  app.post("/api/data-sources/:id/fetch", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sourceId = parseInt(req.params.id);
      
      // Check if source exists
      const source = await storage.getDataSource(sourceId);
      if (!source) {
        return res.status(404).json({ success: false, error: "Data source not found" });
      }
      
      // Fetch data from the specific source
      await dataSourceService.fetchFromSource(sourceId);
      
      // Process the collected data
      await dataSourceService.processCollectedData();
      
      res.status(200).json({ success: true, message: `Data fetch initiated from source: ${source.name}` });
    } catch (error) {
      console.error(`Error fetching data from source:`, error);
      res.status(500).json({ success: false, error: "Failed to fetch data from source" });
    }
  });
  
  app.post("/api/data-sources/:id/manual-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sourceId = parseInt(req.params.id);
      
      // Check if source exists
      const source = await storage.getDataSource(sourceId);
      if (!source) {
        return res.status(404).json({ success: false, error: "Data source not found" });
      }
      
      // Validate the manual data
      const { content, metadata } = req.body;
      if (!content) {
        return res.status(400).json({ success: false, error: "Content is required" });
      }
      
      // Add manual data
      const data = await dataSourceService.addManualData(sourceId, { content, metadata });
      
      // Process the collected data
      await dataSourceService.processCollectedData();
      
      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error("Error adding manual data:", error);
      res.status(500).json({ success: false, error: "Failed to add manual data" });
    }
  });
  
  // Check collected data processing status
  app.get("/api/collected-data/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Query the database for collected data statistics
      const { collectedData } = await import("@shared/schema");
      
      // Get total count
      const [totalResult] = await db.select({ count: count() }).from(collectedData);
      const total = totalResult?.count || 0;
      
      // Get unprocessed count
      const [unprocessedResult] = await db.select({ count: count() })
        .from(collectedData)
        .where(eq(collectedData.status, 'unprocessed'));
      const unprocessed = unprocessedResult?.count || 0;
      
      // Get processed count
      const [processedResult] = await db.select({ count: count() })
        .from(collectedData)
        .where(eq(collectedData.status, 'processed'));
      const processed = processedResult?.count || 0;
      
      // Get error count
      const [errorResult] = await db.select({ count: count() })
        .from(collectedData)
        .where(eq(collectedData.status, 'error'));
      const errors = errorResult?.count || 0;
      
      // Return statistics
      res.status(200).json({
        success: true,
        stats: {
          total,
          unprocessed,
          processed,
          errors
        }
      });
    } catch (error) {
      console.error("Error getting collected data status:", error);
      res.status(500).json({ success: false, error: "Failed to get collected data status" });
    }
  });
  
  // Manual Incident Coordinate API
  app.post("/api/incidents/manual-coordinates", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { latitude, longitude, title, description, severity, region } = req.body;
      
      if (!latitude || !longitude || !title) {
        return res.status(400).json({ success: false, error: "Latitude, longitude and title are required" });
      }
      
      // Validate coordinates are within Nigeria's bounding box
      const nigeriaBox = {
        minLat: 4.0, maxLat: 14.0,
        minLng: 2.5, maxLng: 15.0
      };
      
      if (latitude < nigeriaBox.minLat || latitude > nigeriaBox.maxLat || 
          longitude < nigeriaBox.minLng || longitude > nigeriaBox.maxLng) {
        return res.status(400).json({ 
          success: false, 
          error: "Coordinates are outside Nigeria's boundaries"
        });
      }
      
      // Create location string in the format "lat,lng"
      const location = `${latitude},${longitude}`;
      
      // Create additional location metadata
      const locationMetadata = {
        coordinates: location,
        region: region || "Unknown"
      };
      
      // Create incident data
      const incidentData = {
        title,
        description: description || "",
        severity: severity || "medium",
        region: region || "Unknown",
        location,
        locationMetadata,
        status: 'active',
        reportedAt: new Date().toISOString(),
        reportedBy: req.user?.id || 1, // Default to admin if no user
        category: "conflict"
      };
      
      // Save the incident
      const newIncident = await storage.createIncident(incidentData);
      
      res.status(201).json({ success: true, incident: newIncident });
    } catch (error) {
      console.error("Error creating incident from coordinates:", error);
      res.status(500).json({ success: false, error: "Failed to create incident from coordinates" });
    }
  });

  return httpServer;
}
