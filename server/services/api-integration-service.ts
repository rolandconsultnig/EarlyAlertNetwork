import { randomBytes, createHmac } from "crypto";
import { storage } from "../storage";
import { InsertApiKey, InsertWebhook } from "@shared/schema";
import axios from "axios";

/**
 * API Integration Service
 * 
 * This service provides:
 * - API key generation and validation
 * - Webhook management and event triggering
 */
export class ApiIntegrationService {
  /**
   * Generate a new API key
   */
  generateApiKey(): string {
    return randomBytes(24).toString('hex');
  }

  /**
   * Create a new API key for a user
   */
  async createApiKey(
    userId: number,
    name: string,
    permissions: string[],
    expiresAt?: Date
  ) {
    const key = this.generateApiKey();
    
    const apiKeyData: InsertApiKey = {
      userId,
      name,
      key,
      permissions,
      expiresAt,
      status: "active"
    };
    
    return storage.createApiKey(apiKeyData);
  }

  /**
   * Validate an API key for permissions
   */
  async validateApiKey(key: string, requiredPermission: string): Promise<boolean> {
    // Get API key from database
    const apiKey = await storage.getApiKeyByKey(key);
    
    if (!apiKey) {
      return false;
    }
    
    // Check if API key is active
    if (apiKey.status !== "active") {
      return false;
    }
    
    // Check if API key is expired
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      // Update API key status to expired
      await storage.updateApiKey(apiKey.id, { status: "expired" });
      return false;
    }
    
    // Update last used timestamp
    await storage.updateApiKey(apiKey.id, { lastUsed: new Date() });
    
    // Check if API key has required permission
    const permissions = apiKey.permissions as string[];
    return permissions.includes(requiredPermission) || permissions.includes("*");
  }

  /**
   * Create a new webhook
   */
  async createWebhook(
    userId: number,
    name: string,
    url: string,
    events: string[]
  ) {
    const secret = randomBytes(16).toString('hex');
    
    const webhookData: InsertWebhook = {
      userId,
      name,
      url,
      secret,
      events,
      status: "active"
    };
    
    return storage.createWebhook(webhookData);
  }

  /**
   * Trigger webhooks for a specific event
   */
  async triggerWebhooks(event: string, payload: any): Promise<{success: number, failures: number}> {
    // Get all active webhooks that are subscribed to this event
    const allWebhooks = await storage.getWebhooks();
    const relevantWebhooks = allWebhooks.filter(webhook => 
      webhook.status === "active" && 
      (webhook.events as string[]).includes(event)
    );
    
    if (relevantWebhooks.length === 0) {
      return { success: 0, failures: 0 };
    }
    
    const timestamp = Date.now().toString();
    let success = 0;
    let failures = 0;
    
    // Send webhook events
    for (const webhook of relevantWebhooks) {
      try {
        // Add HMAC signature for verification
        const signature = this.generateSignature(webhook.secret, JSON.stringify(payload));
        
        // Send the webhook request
        await axios.post(webhook.url, payload, {
          headers: {
            'X-EWERS-Webhook-Signature': signature,
            'X-EWERS-Webhook-Event': event,
            'X-EWERS-Webhook-Timestamp': timestamp,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });
        
        // Update the last triggered timestamp
        await storage.updateWebhookLastTriggered(webhook.id);
        success++;
      } catch (error) {
        console.error(`Webhook delivery failed to ${webhook.url}:`, error);
        failures++;
      }
    }
    
    return { success, failures };
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  generateSignature(secret: string, payload: string): string {
    return createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(secret, payload);
    return signature === expectedSignature;
  }
}

export const apiIntegrationService = new ApiIntegrationService();