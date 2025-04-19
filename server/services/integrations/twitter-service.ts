import { TwitterApi } from 'twitter-api-v2';
import { z } from 'zod';

// Environment variables validation
const twitterEnvSchema = z.object({
  TWITTER_API_KEY: z.string().min(1, "TWITTER_API_KEY is required"),
  TWITTER_API_SECRET: z.string().min(1, "TWITTER_API_SECRET is required"),
  TWITTER_ACCESS_TOKEN: z.string().min(1, "TWITTER_ACCESS_TOKEN is required"),
  TWITTER_ACCESS_SECRET: z.string().min(1, "TWITTER_ACCESS_SECRET is required"),
  TWITTER_BEARER_TOKEN: z.string().optional()
});

// Tweet validation schema
const tweetSchema = z.object({
  text: z.string().min(1, "Tweet text is required").max(280, "Tweet exceeds 280 characters"),
  mediaIds: z.array(z.string()).optional(),
  inReplyToId: z.string().optional(),
  quoteTweetId: z.string().optional(),
});

// Search parameters validation schema
const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  maxResults: z.number().optional().default(10),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
});

type Tweet = z.infer<typeof tweetSchema>;
type SearchParams = z.infer<typeof searchSchema>;

class TwitterService {
  private client: TwitterApi | null = null;
  private rwClient: TwitterApi | null = null; // Read-write client
  private roClient: TwitterApi | null = null; // Read-only client
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the Twitter API client with environment variables
   */
  private initialize(): void {
    try {
      const envCheck = twitterEnvSchema.safeParse(process.env);
      
      if (!envCheck.success) {
        console.warn('Twitter environment variables missing or invalid:', 
          envCheck.error.errors.map(e => e.message).join(', '));
        return;
      }
      
      const { 
        TWITTER_API_KEY, 
        TWITTER_API_SECRET, 
        TWITTER_ACCESS_TOKEN, 
        TWITTER_ACCESS_SECRET,
        TWITTER_BEARER_TOKEN 
      } = envCheck.data;
      
      // Create user-authenticated client for read-write operations
      this.rwClient = new TwitterApi({
        appKey: TWITTER_API_KEY,
        appSecret: TWITTER_API_SECRET,
        accessToken: TWITTER_ACCESS_TOKEN,
        accessSecret: TWITTER_ACCESS_SECRET,
      });
      
      // Create client with bearer token for read-only operations (higher rate limits)
      if (TWITTER_BEARER_TOKEN) {
        this.roClient = new TwitterApi(TWITTER_BEARER_TOKEN);
      } else {
        this.roClient = this.rwClient;
      }
      
      // Set default client
      this.client = this.rwClient;
      this.isInitialized = true;
      
      console.log('Twitter service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Twitter service:', error);
    }
  }
  
  /**
   * Check if Twitter client is initialized
   */
  private checkInitialization(): boolean {
    if (!this.isInitialized || !this.client) {
      console.error('Twitter service not initialized. Check your environment variables.');
      return false;
    }
    return true;
  }

  /**
   * Post a tweet to Twitter
   * @param tweet - Tweet object
   */
  async postTweet(tweet: Tweet): Promise<{ success: boolean; tweetId?: string; error?: string }> {
    if (!this.checkInitialization() || !this.rwClient) {
      return { 
        success: false, 
        error: 'Twitter service not initialized. Check your environment variables.' 
      };
    }

    try {
      const validation = tweetSchema.safeParse(tweet);
      if (!validation.success) {
        return { 
          success: false, 
          error: validation.error.errors.map(e => e.message).join(', ') 
        };
      }
      
      const { text, mediaIds, inReplyToId, quoteTweetId } = validation.data;
      
      const tweetOptions: any = {
        text
      };
      
      if (mediaIds && mediaIds.length > 0) {
        tweetOptions.media = { media_ids: mediaIds };
      }
      
      if (inReplyToId) {
        tweetOptions.reply = { in_reply_to_tweet_id: inReplyToId };
      }
      
      if (quoteTweetId) {
        tweetOptions.quote_tweet_id = quoteTweetId;
      }
      
      const tweetResponse = await this.rwClient.v2.tweet(tweetOptions);
      
      if (tweetResponse.errors && tweetResponse.errors.length > 0) {
        throw new Error(tweetResponse.errors[0].detail || 'Unknown Twitter API error');
      }
      
      return {
        success: true,
        tweetId: tweetResponse.data.id
      };
    } catch (error: any) {
      console.error('Error posting tweet:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while posting tweet'
      };
    }
  }

  /**
   * Search for tweets based on a query
   * @param params - Search parameters
   */
  async searchTweets(params: SearchParams): Promise<{ success: boolean; tweets?: any[]; error?: string }> {
    if (!this.checkInitialization() || !this.roClient) {
      return { 
        success: false, 
        error: 'Twitter service not initialized. Check your environment variables.' 
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
      
      const searchOptions: any = {
        max_results: maxResults,
        expansions: [
          'author_id',
          'geo.place_id',
          'referenced_tweets.id'
        ],
        'tweet.fields': [
          'created_at',
          'text',
          'public_metrics',
          'geo',
          'lang'
        ],
        'user.fields': [
          'name',
          'username',
          'profile_image_url',
          'verified'
        ],
        'place.fields': [
          'country',
          'country_code',
          'full_name',
          'geo',
          'name'
        ]
      };
      
      const searchResults = await this.roClient.v2.search(query, searchOptions);
      
      return {
        success: true,
        tweets: searchResults.data.data
      };
    } catch (error: any) {
      console.error('Error searching tweets:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while searching tweets'
      };
    }
  }

  /**
   * Monitor a location for tweets using Twitter streaming API
   * @param boundingBox - Geo coordinates for monitoring [west_long, south_lat, east_long, north_lat]
   * @param callback - Function to call when new tweets are found
   */
  async monitorLocationStream(
    boundingBox: [number, number, number, number], 
    callback: (tweet: any) => void
  ): Promise<{ success: boolean; streamId?: string; error?: string }> {
    if (!this.checkInitialization() || !this.rwClient) {
      return { 
        success: false, 
        error: 'Twitter service not initialized. Check your environment variables.' 
      };
    }

    try {
      const rules = await this.rwClient.v2.streamRules();
      
      // Create a rule for the location
      const bboxString = boundingBox.join(',');
      const query = `bounding_box:[${bboxString}]`;
      const ruleObject = { value: query, tag: 'location-monitoring' };
      
      // Delete any existing rules
      if (rules.data && rules.data.length > 0) {
        await this.rwClient.v2.updateStreamRules({
          delete: { ids: rules.data.map(rule => rule.id) }
        });
      }
      
      // Add the new rule
      await this.rwClient.v2.updateStreamRules({
        add: [ruleObject]
      });
      
      // Start the stream
      const stream = await this.rwClient.v2.searchStream({
        'tweet.fields': ['created_at', 'geo', 'text'],
        'user.fields': ['name', 'username', 'location', 'profile_image_url'],
        'place.fields': ['full_name', 'country', 'country_code', 'geo', 'name']
      });
      
      // Listen for tweets
      stream.on('data', tweetData => {
        callback(tweetData);
      });
      
      // Handle errors
      stream.on('error', error => {
        console.error('Twitter stream error:', error);
      });
      
      return {
        success: true,
        streamId: 'location-monitoring'
      };
    } catch (error: any) {
      console.error('Error setting up Twitter location stream:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while setting up Twitter location stream'
      };
    }
  }

  /**
   * Get the user's timeline
   * @param username - Twitter username
   * @param maxResults - Maximum number of tweets to retrieve
   */
  async getUserTimeline(
    username: string, 
    maxResults: number = 10
  ): Promise<{ success: boolean; tweets?: any[]; error?: string }> {
    if (!this.checkInitialization() || !this.roClient) {
      return { 
        success: false, 
        error: 'Twitter service not initialized. Check your environment variables.' 
      };
    }

    try {
      // First get the user ID from username
      const userResponse = await this.roClient.v2.userByUsername(username);
      
      if (!userResponse.data) {
        return {
          success: false,
          error: `User ${username} not found`
        };
      }
      
      const userId = userResponse.data.id;
      
      // Then get their timeline
      const timelineResponse = await this.roClient.v2.userTimeline(userId, {
        max_results: maxResults,
        'tweet.fields': [
          'created_at',
          'text',
          'public_metrics',
          'geo',
          'lang'
        ]
      });
      
      return {
        success: true,
        tweets: timelineResponse.data.data
      };
    } catch (error: any) {
      console.error(`Error getting timeline for ${username}:`, error);
      return {
        success: false,
        error: error.message || `Unknown error occurred while getting timeline for ${username}`
      };
    }
  }

  /**
   * Verify if the service is properly configured
   */
  verifyConfiguration(): { configured: boolean; missingVars: string[] } {
    const missingVars = [];
    
    if (!process.env.TWITTER_API_KEY) missingVars.push('TWITTER_API_KEY');
    if (!process.env.TWITTER_API_SECRET) missingVars.push('TWITTER_API_SECRET');
    if (!process.env.TWITTER_ACCESS_TOKEN) missingVars.push('TWITTER_ACCESS_TOKEN');
    if (!process.env.TWITTER_ACCESS_SECRET) missingVars.push('TWITTER_ACCESS_SECRET');
    
    return {
      configured: missingVars.length === 0,
      missingVars
    };
  }
}

export const twitterService = new TwitterService();