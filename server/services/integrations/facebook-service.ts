import FB from 'fb';
import { z } from 'zod';

// Environment variables validation
const facebookEnvSchema = z.object({
  FACEBOOK_APP_ID: z.string().min(1, "FACEBOOK_APP_ID is required"),
  FACEBOOK_APP_SECRET: z.string().min(1, "FACEBOOK_APP_SECRET is required"),
  FACEBOOK_ACCESS_TOKEN: z.string().min(1, "FACEBOOK_ACCESS_TOKEN is required"),
  FACEBOOK_PAGE_ID: z.string().optional()
});

// Post validation schema
const postSchema = z.object({
  message: z.string().min(1, "Post message is required"),
  link: z.string().url().optional(),
  picture: z.string().url().optional(),
  name: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  published: z.boolean().optional().default(true),
  targetPageId: z.string().optional()
});

type FacebookPost = z.infer<typeof postSchema>;

class FacebookService {
  private isInitialized: boolean = false;
  private appId: string | null = null;
  private appSecret: string | null = null;
  private accessToken: string | null = null;
  private pageId: string | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the Facebook API client with environment variables
   */
  private initialize(): void {
    try {
      const envCheck = facebookEnvSchema.safeParse(process.env);
      
      if (!envCheck.success) {
        console.warn('Facebook environment variables missing or invalid:', 
          envCheck.error.errors.map(e => e.message).join(', '));
        return;
      }
      
      const { 
        FACEBOOK_APP_ID, 
        FACEBOOK_APP_SECRET, 
        FACEBOOK_ACCESS_TOKEN,
        FACEBOOK_PAGE_ID
      } = envCheck.data;
      
      this.appId = FACEBOOK_APP_ID;
      this.appSecret = FACEBOOK_APP_SECRET;
      this.accessToken = FACEBOOK_ACCESS_TOKEN;
      this.pageId = FACEBOOK_PAGE_ID || null;
      
      FB.options({
        appId: this.appId,
        appSecret: this.appSecret,
        accessToken: this.accessToken,
        version: 'v16.0' // Use a recent Facebook Graph API version
      });
      
      this.isInitialized = true;
      console.log('Facebook service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Facebook service:', error);
    }
  }
  
  /**
   * Check if Facebook client is initialized
   */
  private checkInitialization(): boolean {
    if (!this.isInitialized || !this.accessToken) {
      console.error('Facebook service not initialized. Check your environment variables.');
      return false;
    }
    return true;
  }

  /**
   * Post a message to Facebook (either on a page or as a user)
   * @param post - Facebook post object
   */
  async createPost(post: FacebookPost): Promise<{ success: boolean; postId?: string; error?: string }> {
    if (!this.checkInitialization()) {
      return { 
        success: false, 
        error: 'Facebook service not initialized. Check your environment variables.' 
      };
    }

    try {
      const validation = postSchema.safeParse(post);
      if (!validation.success) {
        return { 
          success: false, 
          error: validation.error.errors.map(e => e.message).join(', ') 
        };
      }
      
      const { 
        message, 
        link, 
        picture, 
        name, 
        caption, 
        description, 
        published, 
        targetPageId 
      } = validation.data;
      
      // Determine target: page post or user post
      const target = targetPageId || this.pageId || 'me';
      
      // Prepare post data
      const postData: any = {
        message,
        published: (published === undefined ? true : published) ? 'true' : 'false'
      };
      
      // Add link data if present
      if (link) {
        postData.link = link;
        
        if (picture) postData.picture = picture;
        if (name) postData.name = name;
        if (caption) postData.caption = caption;
        if (description) postData.description = description;
      }
      
      // Make the API call
      return new Promise((resolve, reject) => {
        FB.api(
          `/${target}/feed`,
          'POST',
          postData,
          (response: any) => {
            if (!response || response.error) {
              console.error('Error posting to Facebook:', response?.error);
              resolve({
                success: false,
                error: response?.error?.message || 'Unknown error occurred while posting to Facebook'
              });
            } else {
              resolve({
                success: true,
                postId: response.id
              });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Error creating Facebook post:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while creating Facebook post'
      };
    }
  }

  /**
   * Get posts from a Facebook page or user feed
   * @param targetId - Facebook page or user ID (defaults to the configured page)
   * @param limit - Maximum number of posts to retrieve
   */
  async getPosts(
    targetId?: string, 
    limit: number = 10
  ): Promise<{ success: boolean; posts?: any[]; error?: string }> {
    if (!this.checkInitialization()) {
      return { 
        success: false, 
        error: 'Facebook service not initialized. Check your environment variables.' 
      };
    }

    try {
      const target = targetId || this.pageId || 'me';
      
      // Make the API call
      return new Promise((resolve, reject) => {
        FB.api(
          `/${target}/feed`,
          'GET',
          { limit },
          (response: any) => {
            if (!response || response.error) {
              console.error('Error getting Facebook posts:', response?.error);
              resolve({
                success: false,
                error: response?.error?.message || 'Unknown error occurred while getting Facebook posts'
              });
            } else {
              resolve({
                success: true,
                posts: response.data
              });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Error getting Facebook posts:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while getting Facebook posts'
      };
    }
  }

  /**
   * Search Facebook for public posts matching a query
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   */
  async searchPosts(
    query: string, 
    limit: number = 10
  ): Promise<{ success: boolean; results?: any[]; error?: string }> {
    if (!this.checkInitialization()) {
      return { 
        success: false, 
        error: 'Facebook service not initialized. Check your environment variables.' 
      };
    }

    try {
      // Make the API call
      return new Promise((resolve, reject) => {
        FB.api(
          '/search',
          'GET',
          {
            q: query,
            type: 'post',
            limit
          },
          (response: any) => {
            if (!response || response.error) {
              console.error('Error searching Facebook posts:', response?.error);
              resolve({
                success: false,
                error: response?.error?.message || 'Unknown error occurred while searching Facebook posts'
              });
            } else {
              resolve({
                success: true,
                results: response.data
              });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Error searching Facebook posts:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while searching Facebook posts'
      };
    }
  }

  /**
   * Post a photo to Facebook (either on a page or as a user)
   * @param imageUrl - URL of the image to post
   * @param message - Optional caption for the photo
   * @param targetPageId - Optional page ID to post to (defaults to configured page)
   */
  async postPhoto(
    imageUrl: string,
    message?: string,
    targetPageId?: string
  ): Promise<{ success: boolean; photoId?: string; error?: string }> {
    if (!this.checkInitialization()) {
      return { 
        success: false, 
        error: 'Facebook service not initialized. Check your environment variables.' 
      };
    }

    try {
      // Determine target: page post or user post
      const target = targetPageId || this.pageId || 'me';
      
      // Prepare post data
      const photoData: any = {
        url: imageUrl
      };
      
      if (message) {
        photoData.message = message;
      }
      
      // Make the API call
      return new Promise((resolve, reject) => {
        FB.api(
          `/${target}/photos`,
          'POST',
          photoData,
          (response: any) => {
            if (!response || response.error) {
              console.error('Error posting photo to Facebook:', response?.error);
              resolve({
                success: false,
                error: response?.error?.message || 'Unknown error occurred while posting photo to Facebook'
              });
            } else {
              resolve({
                success: true,
                photoId: response.id
              });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Error posting photo to Facebook:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while posting photo to Facebook'
      };
    }
  }

  /**
   * Verify if the service is properly configured
   */
  verifyConfiguration(): { configured: boolean; missingVars: string[] } {
    const missingVars = [];
    
    if (!process.env.FACEBOOK_APP_ID) missingVars.push('FACEBOOK_APP_ID');
    if (!process.env.FACEBOOK_APP_SECRET) missingVars.push('FACEBOOK_APP_SECRET');
    if (!process.env.FACEBOOK_ACCESS_TOKEN) missingVars.push('FACEBOOK_ACCESS_TOKEN');
    
    return {
      configured: missingVars.length === 0,
      missingVars
    };
  }
}

export const facebookService = new FacebookService();