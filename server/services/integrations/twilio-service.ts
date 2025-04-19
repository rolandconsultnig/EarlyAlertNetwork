import twilio from 'twilio';
import { z } from 'zod';

// Environment variables validation
const twilioEnvSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().min(1, "TWILIO_ACCOUNT_SID is required"),
  TWILIO_AUTH_TOKEN: z.string().min(1, "TWILIO_AUTH_TOKEN is required"),
  TWILIO_PHONE_NUMBER: z.string().min(1, "TWILIO_PHONE_NUMBER is required"),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),
});

// Message validation schema
const messageSchema = z.object({
  to: z.string().min(1, "Recipient phone number is required"),
  body: z.string().min(1, "Message body is required"),
  mediaUrl: z.string().url().optional(),
});

type TwilioMessage = z.infer<typeof messageSchema>;

class TwilioService {
  private client: twilio.Twilio | null = null;
  private accountSid: string | null = null;
  private authToken: string | null = null;
  private phoneNumber: string | null = null;
  private whatsappNumber: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the Twilio client with environment variables
   */
  private initialize(): void {
    try {
      const envCheck = twilioEnvSchema.safeParse(process.env);
      
      if (!envCheck.success) {
        console.warn('Twilio environment variables missing or invalid:', 
          envCheck.error.errors.map(e => e.message).join(', '));
        return;
      }
      
      const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_WHATSAPP_NUMBER } = envCheck.data;
      
      this.accountSid = TWILIO_ACCOUNT_SID;
      this.authToken = TWILIO_AUTH_TOKEN;
      this.phoneNumber = TWILIO_PHONE_NUMBER;
      this.whatsappNumber = TWILIO_WHATSAPP_NUMBER || null;
      
      this.client = twilio(this.accountSid, this.authToken);
      this.isInitialized = true;
      
      console.log('Twilio service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Twilio service:', error);
    }
  }
  
  /**
   * Check if Twilio client is initialized
   */
  private checkInitialization(): boolean {
    if (!this.isInitialized || !this.client) {
      console.error('Twilio service not initialized. Check your environment variables.');
      return false;
    }
    return true;
  }

  /**
   * Send SMS message via Twilio
   * @param message - SMS message object
   */
  async sendSMS(message: TwilioMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.checkInitialization()) {
      return { 
        success: false, 
        error: 'Twilio service not initialized. Check your environment variables.' 
      };
    }

    try {
      const validation = messageSchema.safeParse(message);
      if (!validation.success) {
        return { 
          success: false, 
          error: validation.error.errors.map(e => e.message).join(', ') 
        };
      }
      
      const { to, body, mediaUrl } = validation.data;
      
      const messageOptions: any = {
        body,
        from: this.phoneNumber!,
        to
      };
      
      // Add media URL if provided
      if (mediaUrl) {
        messageOptions.mediaUrl = [mediaUrl];
      }
      
      const twilioMessage = await this.client!.messages.create(messageOptions);
      
      return {
        success: true,
        messageId: twilioMessage.sid
      };
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while sending SMS'
      };
    }
  }

  /**
   * Send WhatsApp message via Twilio
   * @param message - WhatsApp message object
   */
  async sendWhatsApp(message: TwilioMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.checkInitialization()) {
      return { 
        success: false, 
        error: 'Twilio service not initialized. Check your environment variables.' 
      };
    }

    if (!this.whatsappNumber) {
      return { 
        success: false, 
        error: 'WhatsApp number not configured. Set TWILIO_WHATSAPP_NUMBER environment variable.' 
      };
    }

    try {
      const validation = messageSchema.safeParse(message);
      if (!validation.success) {
        return { 
          success: false, 
          error: validation.error.errors.map(e => e.message).join(', ') 
        };
      }
      
      const { to, body, mediaUrl } = validation.data;
      
      // Format WhatsApp numbers with whatsapp: prefix
      const fromWhatsApp = `whatsapp:${this.whatsappNumber}`;
      const toWhatsApp = `whatsapp:${to}`;
      
      const messageOptions: any = {
        body,
        from: fromWhatsApp,
        to: toWhatsApp
      };
      
      // Add media URL if provided
      if (mediaUrl) {
        messageOptions.mediaUrl = [mediaUrl];
      }
      
      const twilioMessage = await this.client!.messages.create(messageOptions);
      
      return {
        success: true,
        messageId: twilioMessage.sid
      };
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while sending WhatsApp message'
      };
    }
  }

  /**
   * Send bulk SMS messages to multiple recipients
   * @param recipients - Array of phone numbers
   * @param body - Message content
   * @param mediaUrl - Optional URL to media
   */
  async sendBulkSMS(
    recipients: string[], 
    body: string, 
    mediaUrl?: string
  ): Promise<{ success: boolean; results: any[]; error?: string }> {
    if (!this.checkInitialization()) {
      return { 
        success: false, 
        results: [],
        error: 'Twilio service not initialized. Check your environment variables.' 
      };
    }

    try {
      const results = [];
      const failedNumbers = [];
      
      for (const to of recipients) {
        const result = await this.sendSMS({ to, body, mediaUrl });
        results.push(result);
        
        if (!result.success) {
          failedNumbers.push(to);
        }
      }
      
      return {
        success: failedNumbers.length === 0,
        results,
        error: failedNumbers.length > 0 
          ? `Failed to send SMS to ${failedNumbers.length} recipients` 
          : undefined
      };
    } catch (error: any) {
      console.error('Error sending bulk SMS:', error);
      return {
        success: false,
        results: [],
        error: error.message || 'Unknown error occurred while sending bulk SMS'
      };
    }
  }

  /**
   * Verify if the service is properly configured
   */
  verifyConfiguration(): { configured: boolean; missingVars: string[] } {
    const missingVars = [];
    
    if (!process.env.TWILIO_ACCOUNT_SID) missingVars.push('TWILIO_ACCOUNT_SID');
    if (!process.env.TWILIO_AUTH_TOKEN) missingVars.push('TWILIO_AUTH_TOKEN');
    if (!process.env.TWILIO_PHONE_NUMBER) missingVars.push('TWILIO_PHONE_NUMBER');
    
    return {
      configured: missingVars.length === 0,
      missingVars
    };
  }
}

export const twilioService = new TwilioService();