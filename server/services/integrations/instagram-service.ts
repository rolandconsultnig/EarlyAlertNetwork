import { IgApiClient } from 'instagram-private-api';
import { z } from 'zod';
import fs from 'fs';
import { promisify } from 'util';
import axios from 'axios';
import { Readable } from 'stream';

// Create promisified fs functions
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Environment variables validation
const instagramEnvSchema = z.object({
  INSTAGRAM_USERNAME: z.string().min(1, "INSTAGRAM_USERNAME is required"),
  INSTAGRAM_PASSWORD: z.string().min(1, "INSTAGRAM_PASSWORD is required")
});

// Post validation schema
const postSchema = z.object({
  caption: z.string().min(1, "Post caption is required"),
  mediaUrl: z.string().url().min(1, "Media URL is required"),
  isStory: z.boolean().optional().default(false)
});

// Search validation schema
const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  maxResults: z.number().optional().default(10)
});

type InstagramPost = z.infer<typeof postSchema>;
type SearchParams = z.infer<typeof searchSchema>;

class InstagramService {
  private ig: IgApiClient = new IgApiClient();
  private isInitialized: boolean = false;
  private username: string | null = null;
  private password: string | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the Instagram API client with environment variables
   */
  private async initialize(): Promise<void> {
    try {
      const envCheck = instagramEnvSchema.safeParse(process.env);
      
      if (!envCheck.success) {
        console.warn('Instagram environment variables missing or invalid:', 
          envCheck.error.errors.map(e => e.message).join(', '));
        return;
      }
      
      const { INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } = envCheck.data;
      
      this.username = INSTAGRAM_USERNAME;
      this.password = INSTAGRAM_PASSWORD;
      this.ig.state.generateDevice(this.username);
      
      // Don't login here as it would happen on app startup
      // Login will happen lazily when needed
      
      this.isInitialized = true;
      console.log('Instagram service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Instagram service:', error);
    }
  }
  
  /**
   * Login to Instagram (called before operations if needed)
   */
  private async login(): Promise<boolean> {
    if (!this.username || !this.password) {
      console.error('Instagram credentials not configured');
      return false;
    }
    
    try {
      // Attempt to login
      await this.ig.account.login(this.username, this.password);
      return true;
    } catch (error) {
      console.error('Instagram login failed:', error);
      return false;
    }
  }
  
  /**
   * Check if Instagram client is initialized
   */
  private async checkInitialization(): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('Instagram service not initialized. Check your environment variables.');
      return false;
    }
    
    try {
      // Check if already logged in, if not, login
      if (!this.ig.state.cookieJar.getCookieString) {
        return await this.login();
      }
      return true;
    } catch (error) {
      console.error('Error checking Instagram initialization:', error);
      return false;
    }
  }

  /**
   * Download image from URL to temporary file
   * @param url - URL of the image
   * @returns Path to the temporary file
   */
  private async downloadImageToTemp(url: string): Promise<string> {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
      });
      
      const buffer = Buffer.from(response.data, 'binary');
      const tempPath = `./temp_${Date.now()}.jpg`;
      
      await writeFile(tempPath, buffer);
      return tempPath;
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  /**
   * Post media to Instagram
   * @param post - Instagram post object
   */
  async createPost(post: InstagramPost): Promise<{ success: boolean; mediaId?: string; error?: string }> {
    const isInitialized = await this.checkInitialization();
    if (!isInitialized) {
      return { 
        success: false, 
        error: 'Instagram service not initialized or login failed. Check your environment variables.' 
      };
    }

    let tempFilePath: string | null = null;

    try {
      const validation = postSchema.safeParse(post);
      if (!validation.success) {
        return { 
          success: false, 
          error: validation.error.errors.map(e => e.message).join(', ') 
        };
      }
      
      const { caption, mediaUrl, isStory } = validation.data;
      
      // Download media to temporary file
      tempFilePath = await this.downloadImageToTemp(mediaUrl);
      
      let mediaId;
      
      if (isStory) {
        // Post as a story
        const publishResult = await this.ig.publish.story({
          file: tempFilePath
        });
        mediaId = publishResult.media_id;
      } else {
        // Post as a regular feed post
        const publishResult = await this.ig.publish.photo({
          file: tempFilePath,
          caption
        });
        mediaId = publishResult.media_id;
      }
      
      return {
        success: true,
        mediaId
      };
    } catch (error: any) {
      console.error('Error creating Instagram post:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while creating Instagram post'
      };
    } finally {
      // Clean up temporary file
      if (tempFilePath) {
        try {
          await unlink(tempFilePath);
        } catch (e) {
          console.error('Error deleting temporary file:', e);
        }
      }
    }
  }

  /**
   * Search for users or hashtags on Instagram
   * @param params - Search parameters
   */
  async search(params: SearchParams): Promise<{ success: boolean; results?: any[]; error?: string }> {
    const isInitialized = await this.checkInitialization();
    if (!isInitialized) {
      return { 
        success: false, 
        error: 'Instagram service not initialized or login failed. Check your environment variables.' 
      };
    }

    try {
      const validation = searchSchema.safeParse(params);
      if (!validation.success) {
        return { 
          success: false, 
          error: validation.error.errors.map(e => e.message).join(', ') 
        };
      }
      
      const { query, maxResults } = validation.data;
      
      // Search for users
      const userResults = await this.ig.user.search(query);
      
      // Search for hashtags
      const hashtagResults = await this.ig.feed.tags(query).items();
      
      // Combine and limit results
      const combinedResults = [
        ...userResults.map(user => ({ type: 'user', ...user })),
        ...hashtagResults.map(post => ({ type: 'post', ...post }))
      ].slice(0, maxResults);
      
      return {
        success: true,
        results: combinedResults
      };
    } catch (error: any) {
      console.error('Error searching Instagram:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while searching Instagram'
      };
    }
  }

  /**
   * Get feed from a specific location
   * @param locationId - Instagram location ID
   * @param maxResults - Maximum number of posts to retrieve
   */
  async getLocationFeed(
    locationId: string, 
    maxResults: number = 10
  ): Promise<{ success: boolean; posts?: any[]; error?: string }> {
    const isInitialized = await this.checkInitialization();
    if (!isInitialized) {
      return { 
        success: false, 
        error: 'Instagram service not initialized or login failed. Check your environment variables.' 
      };
    }

    try {
      // Get location feed
      const locationFeed = this.ig.feed.location(locationId);
      const posts = await locationFeed.items();
      
      return {
        success: true,
        posts: posts.slice(0, maxResults)
      };
    } catch (error: any) {
      console.error(`Error getting Instagram location feed for ${locationId}:`, error);
      return {
        success: false,
        error: error.message || `Unknown error occurred while getting Instagram location feed for ${locationId}`
      };
    }
  }

  /**
   * Search for locations near coordinates
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param maxResults - Maximum number of locations to retrieve
   */
  async searchLocations(
    latitude: number,
    longitude: number,
    maxResults: number = 10
  ): Promise<{ success: boolean; locations?: any[]; error?: string }> {
    const isInitialized = await this.checkInitialization();
    if (!isInitialized) {
      return { 
        success: false, 
        error: 'Instagram service not initialized or login failed. Check your environment variables.' 
      };
    }

    try {
      // Search for locations near coordinates
      const locations = await this.ig.search.location(latitude, longitude);
      
      return {
        success: true,
        locations: locations.slice(0, maxResults)
      };
    } catch (error: any) {
      console.error(`Error searching Instagram locations at ${latitude},${longitude}:`, error);
      return {
        success: false,
        error: error.message || `Unknown error occurred while searching Instagram locations`
      };
    }
  }

  /**
   * Verify if the service is properly configured
   */
  verifyConfiguration(): { configured: boolean; missingVars: string[] } {
    const missingVars = [];
    
    if (!process.env.INSTAGRAM_USERNAME) missingVars.push('INSTAGRAM_USERNAME');
    if (!process.env.INSTAGRAM_PASSWORD) missingVars.push('INSTAGRAM_PASSWORD');
    
    return {
      configured: missingVars.length === 0,
      missingVars
    };
  }
}

export const instagramService = new InstagramService();