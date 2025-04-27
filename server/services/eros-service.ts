import axios from 'axios';

// USGS Earth Explorer API Service
// Documentation: https://earthexplorer.usgs.gov/inventory/documentation/json-api

const EROS_API_URL = 'https://earthexplorer.usgs.gov/inventory/json/v/1.4.1';

interface EROSCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  errorCode: string | null;
  error: string | null;
  data: {
    token: string;
  };
}

interface SceneResponse {
  errorCode: string | null;
  error: string | null;
  data: {
    results: Array<{
      entityId: string;
      displayId: string;
      acquisitionDate: string;
      browseUrl: string;
      downloadUrl?: string;
      metadataUrl: string;
      [key: string]: any;
    }>;
    totalHits: number;
    startingNumber: number;
    recordsReturned: number;
    nextRecord: number;
  };
}

interface GeographicBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface SceneFilter {
  datasetName: string;
  spatialFilter: {
    filterType: 'mbr';
    lowerLeft: {
      latitude: number;
      longitude: number;
    };
    upperRight: {
      latitude: number;
      longitude: number;
    };
  };
  temporalFilter?: {
    startDate: string;
    endDate: string;
  };
  cloudCoverFilter?: {
    min: number;
    max: number;
  };
  maxResults?: number;
}

class EROSService {
  private apiKey: string | null = null;
  private readonly username: string;
  private readonly password: string;
  
  constructor() {
    // Get EROS credentials from environment variables
    this.username = process.env.EROS_USERNAME || '';
    this.password = process.env.EROS_PASSWORD || '';
    this.apiKey = process.env.EROS_API_KEY || null;
    
    if (this.apiKey) {
      console.log('Using provided EROS API key.');
    } else if (!this.username || !this.password) {
      console.warn('EROS credentials not set. Satellite imagery features will be limited.');
    } else {
      console.log('EROS username/password found. Will attempt login for API key.');
    }
  }
  
  /**
   * Log in to the EROS service and get an API key
   */
  async login(): Promise<string> {
    if (this.apiKey) {
      return this.apiKey;
    }
    
    try {
      const response = await axios.post<LoginResponse>(`${EROS_API_URL}/login`, {
        username: this.username,
        password: this.password
      });
      
      if (response.data.errorCode) {
        throw new Error(`EROS login error: ${response.data.error}`);
      }
      
      this.apiKey = response.data.data.token;
      return this.apiKey;
    } catch (error) {
      console.error('EROS login failed:', error);
      throw new Error('Failed to authenticate with EROS service');
    }
  }
  
  /**
   * Search for available datasets
   */
  async searchDatasets(): Promise<any> {
    const apiKey = await this.login();
    
    try {
      const response = await axios.post(`${EROS_API_URL}/datasets`, {
        apiKey,
        publicOnly: true
      });
      
      if (response.data.errorCode) {
        throw new Error(`EROS datasets error: ${response.data.error}`);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('EROS datasets search failed:', error);
      throw new Error('Failed to retrieve EROS datasets');
    }
  }
  
  /**
   * Search for scenes in a specific geographic area
   */
  async searchScenes(
    datasetName: string,
    boundingBox: GeographicBoundingBox,
    startDate?: string,
    endDate?: string,
    maxCloudCover = 100,
    maxResults = 10
  ): Promise<any> {
    console.log(`Searching for scenes: ${datasetName} in bbox: ${JSON.stringify(boundingBox)}`);
    console.log(`Date range: ${startDate} to ${endDate}, max cloud cover: ${maxCloudCover}`);
    
    try {
      const apiKey = await this.login();
      console.log('API key obtained for EROS search:', apiKey ? 'Valid key received' : 'No API key');
      
      const filter: SceneFilter = {
        datasetName,
        spatialFilter: {
          filterType: 'mbr',
          lowerLeft: {
            latitude: boundingBox.south,
            longitude: boundingBox.west
          },
          upperRight: {
            latitude: boundingBox.north,
            longitude: boundingBox.east
          }
        },
        maxResults
      };
      
      // Add temporal filter if dates are provided
      if (startDate && endDate) {
        filter.temporalFilter = {
          startDate,
          endDate
        };
      }
      
      // Add cloud cover filter
      filter.cloudCoverFilter = {
        min: 0,
        max: maxCloudCover
      };
      
      console.log('EROS search request filter:', JSON.stringify(filter));
      
      const requestData = {
        apiKey,
        datasetName,
        maxResults,
        startingNumber: 1,
        sortOrder: 'DESC',
        sortBy: 'acquisitionDate',
        filterOptions: filter
      };
      
      console.log('Sending EROS search request to:', `${EROS_API_URL}/search`);
      const response = await axios.post<SceneResponse>(`${EROS_API_URL}/search`, requestData);
      
      console.log('EROS search response received, status:', response.status);
      
      if (response.data.errorCode) {
        console.error(`EROS API error: ${response.data.errorCode} - ${response.data.error}`);
        throw new Error(`EROS scene search error: ${response.data.error}`);
      }
      
      const results = response.data.data.results || [];
      console.log(`Found ${results.length} scenes`);
      
      if (results.length === 0) {
        console.log('No scenes found for the current criteria');
      } else {
        console.log('First scene:', JSON.stringify(results[0]));
      }
      
      return results.map(scene => ({
        id: scene.entityId,
        displayId: scene.displayId,
        acquisitionDate: scene.acquisitionDate,
        thumbnailUrl: scene.browseUrl,
        downloadUrl: scene.downloadUrl,
        metadataUrl: scene.metadataUrl
      }));
    } catch (error) {
      console.error('EROS scene search failed:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('EROS API error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      }
      
      throw new Error(`Failed to search for satellite imagery: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get metadata for a specific scene
   */
  async getSceneMetadata(datasetName: string, entityId: string): Promise<any> {
    const apiKey = await this.login();
    
    try {
      const response = await axios.post(`${EROS_API_URL}/metadata`, {
        apiKey,
        datasetName,
        entityId
      });
      
      if (response.data.errorCode) {
        throw new Error(`EROS metadata error: ${response.data.error}`);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('EROS metadata retrieval failed:', error);
      throw new Error('Failed to retrieve scene metadata');
    }
  }
  
  /**
   * Get a download URL for a specific scene
   */
  async getDownloadUrl(datasetName: string, entityId: string): Promise<string> {
    const apiKey = await this.login();
    
    try {
      const response = await axios.post(`${EROS_API_URL}/download`, {
        apiKey,
        datasetName,
        entityId
      });
      
      if (response.data.errorCode) {
        throw new Error(`EROS download error: ${response.data.error}`);
      }
      
      return response.data.data.url;
    } catch (error) {
      console.error('EROS download URL retrieval failed:', error);
      throw new Error('Failed to get download URL');
    }
  }
  
  /**
   * Nigeria-specific helper method to fetch recent Landsat imagery for a region
   */
  async getNigeriaLandsatImagery(
    regionName: string,
    lat: number,
    lng: number,
    radiusKm = 50,
    maxResults = 5
  ): Promise<any[]> {
    // Convert radius to approximate latitude/longitude degree delta
    // 1 degree latitude ≈ 111 km, 1 degree longitude varies but at equator ≈ 111 km
    const degreesDelta = radiusKm / 111;
    
    const boundingBox = {
      north: lat + degreesDelta,
      south: lat - degreesDelta,
      east: lng + degreesDelta,
      west: lng - degreesDelta
    };
    
    // Get current date and date 6 months ago
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    try {
      // Try Landsat 9 first
      const landsat9Results = await this.searchScenes(
        'landsat_ot_c2_l2',
        boundingBox,
        startDate,
        endDate,
        30, // Max cloud cover percentage
        maxResults
      );
      
      // If no results, try Landsat 8
      if (landsat9Results.length === 0) {
        return await this.searchScenes(
          'landsat_ot_c2_l2',
          boundingBox,
          startDate,
          endDate,
          50, // Increase cloud cover tolerance
          maxResults
        );
      }
      
      return landsat9Results;
    } catch (error) {
      console.error(`Failed to get Landsat imagery for ${regionName}:`, error);
      return [];
    }
  }
  
  /**
   * Nigeria-specific helper method to fetch recent Sentinel imagery for a region
   */
  async getNigeriaSentinelImagery(
    regionName: string,
    lat: number,
    lng: number,
    radiusKm = 50,
    maxResults = 5
  ): Promise<any[]> {
    // Convert radius to approximate latitude/longitude degree delta
    const degreesDelta = radiusKm / 111;
    
    const boundingBox = {
      north: lat + degreesDelta,
      south: lat - degreesDelta,
      east: lng + degreesDelta,
      west: lng - degreesDelta
    };
    
    // Get current date and date 3 months ago
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    try {
      return await this.searchScenes(
        'sentinel_2a',
        boundingBox,
        startDate,
        endDate,
        30, // Max cloud cover percentage
        maxResults
      );
    } catch (error) {
      console.error(`Failed to get Sentinel imagery for ${regionName}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const erosService = new EROSService();