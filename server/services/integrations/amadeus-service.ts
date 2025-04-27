import Amadeus from 'amadeus';

// Create integration response interface
interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Amadeus Travel API Service
 * Provides flight, airport, and travel information for Nigeria and Africa.
 * Replacing Dana Air (no longer operational) with current Nigerian carriers.
 */
class AmadeusService {
  private amadeus: Amadeus;
  private configured: boolean = false;

  constructor() {
    // Initialize Amadeus API client
    try {
      const clientId = process.env.AMADEUS_API_KEY;
      const clientSecret = process.env.AMADEUS_API_SECRET;

      if (!clientId || !clientSecret) {
        console.warn('Amadeus API credentials missing. Service will not work until configured.');
        this.configured = false;
        // Create an instance anyway to prevent crashes, but it won't work
        this.amadeus = new Amadeus({
          clientId: 'DEMO',
          clientSecret: 'DEMO'
        });
      } else {
        this.amadeus = new Amadeus({
          clientId,
          clientSecret,
          hostname: 'test.api.amadeus.com' // Use test environment
        });
        this.configured = true;
        console.log('Amadeus API service initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Amadeus API service:', error);
      // Create a dummy instance to prevent crashes
      this.amadeus = new Amadeus({
        clientId: 'DEMO',
        clientSecret: 'DEMO'
      });
      this.configured = false;
    }
  }

  /**
   * Verify service configuration
   * @returns Configuration status
   */
  verifyConfiguration(): { configured: boolean; missingVars: string[] } {
    const missingVars = [];
    
    if (!process.env.AMADEUS_API_KEY) missingVars.push('AMADEUS_API_KEY');
    if (!process.env.AMADEUS_API_SECRET) missingVars.push('AMADEUS_API_SECRET');
    
    this.configured = missingVars.length === 0;
    
    return {
      configured: this.configured,
      missingVars
    };
  }

  /**
   * Search for flights using Nigerian airlines
   * @param originCode Airport IATA code
   * @param destinationCode Airport IATA code
   * @param departureDate Departure date (YYYY-MM-DD)
   * @param returnDate Optional return date for round trips
   * @param adults Number of adult passengers
   * @param travelClass Optional travel class
   * @returns Flight search results
   */
  async searchFlights(
    originCode: string,
    destinationCode: string,
    departureDate: string,
    returnDate?: string,
    adults: number = 1,
    travelClass: string = 'ECONOMY'
  ): Promise<IntegrationResponse> {
    if (!this.configured) {
      return {
        success: false,
        error: 'Amadeus API service not configured. Missing API credentials.'
      };
    }

    try {
      // Validate inputs
      if (!originCode || !destinationCode || !departureDate) {
        return {
          success: false,
          error: 'Missing required parameters: origin, destination, or departure date'
        };
      }

      // Build search parameters
      const searchParams: any = {
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate,
        adults: adults.toString(),
        currencyCode: 'NGN',
        max: '10'
      };

      // Add optional parameters if provided
      if (returnDate) {
        searchParams.returnDate = returnDate;
      }

      if (travelClass && ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].includes(travelClass.toUpperCase())) {
        searchParams.travelClass = travelClass.toUpperCase();
      }

      // Filter to include primarily Nigerian airlines by default
      // Air Peace, Arik Air, Ibom Air, etc.
      searchParams.includedAirlineCodes = 'P4,W3,QI';

      // Perform the search
      const response = await this.amadeus.shopping.flightOffersSearch.get(searchParams);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Amadeus flight search error:', error);
      const errorMessage = error.response?.body?.errors?.[0]?.detail || 
                          error.response?.description || 
                          error.message || 
                          'Unknown error during flight search';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Search for airports in Nigeria and surrounding countries
   * @param keyword Search keyword or city name
   * @param subType Filter by airport subtype
   * @returns List of matching airports
   */
  async searchAirports(
    keyword: string, 
    subType: 'AIRPORT' | 'CITY' | 'METROPOLITAN_AREA' | undefined = undefined
  ): Promise<IntegrationResponse> {
    if (!this.configured) {
      return {
        success: false,
        error: 'Amadeus API service not configured. Missing API credentials.'
      };
    }

    try {
      // Validate inputs
      if (!keyword || keyword.length < 2) {
        return {
          success: false,
          error: 'Search keyword must be at least 2 characters'
        };
      }

      // Build search parameters
      const searchParams: any = {
        keyword,
        countryCode: 'NG', // Focus on Nigeria
        max: 10
      };

      // Add subType if specified
      if (subType) {
        searchParams.subType = subType;
      }

      // Perform the search
      const response = await this.amadeus.referenceData.locations.get(searchParams);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Amadeus airport search error:', error);
      const errorMessage = error.response?.body?.errors?.[0]?.detail || 
                          error.response?.description || 
                          error.message || 
                          'Unknown error during airport search';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get flight price for given itinerary
   * @param flightOffer Flight offer object from search results
   * @returns Confirmed flight price
   */
  async confirmFlightPrice(flightOffer: any): Promise<IntegrationResponse> {
    if (!this.configured) {
      return {
        success: false,
        error: 'Amadeus API service not configured. Missing API credentials.'
      };
    }

    try {
      // Validate inputs
      if (!flightOffer) {
        return {
          success: false,
          error: 'Flight offer data is required'
        };
      }

      // Prepare the request body
      const requestBody = {
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer]
        }
      };

      // Confirm the price
      const response = await this.amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify(requestBody)
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Amadeus price confirmation error:', error);
      const errorMessage = error.response?.body?.errors?.[0]?.detail || 
                          error.response?.description || 
                          error.message || 
                          'Unknown error during price confirmation';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get city information and points of interest
   * @param cityCode City IATA code
   * @returns City information and points of interest
   */
  async getCityInfo(cityCode: string): Promise<IntegrationResponse> {
    if (!this.configured) {
      return {
        success: false,
        error: 'Amadeus API service not configured. Missing API credentials.'
      };
    }

    try {
      // Validate inputs
      if (!cityCode) {
        return {
          success: false,
          error: 'City code is required'
        };
      }

      // Get points of interest
      const response = await this.amadeus.referenceData.locations.pointsOfInterest.get({
        cityCode
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Amadeus city info error:', error);
      const errorMessage = error.response?.body?.errors?.[0]?.detail || 
                          error.response?.description || 
                          error.message || 
                          'Unknown error retrieving city information';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get information about flight schedules
   * @param originCode Origin airport code
   * @param destinationCode Destination airport code
   * @param departureDate Departure date (YYYY-MM-DD)
   * @returns Flight schedule information
   */
  async getFlightSchedules(
    originCode: string,
    destinationCode: string,
    departureDate: string
  ): Promise<IntegrationResponse> {
    if (!this.configured) {
      return {
        success: false,
        error: 'Amadeus API service not configured. Missing API credentials.'
      };
    }

    try {
      // Validate inputs
      if (!originCode || !destinationCode || !departureDate) {
        return {
          success: false,
          error: 'Missing required parameters: origin, destination, or departure date'
        };
      }

      // Build search parameters
      const searchParams = {
        carrierCode: 'P4', // Default to Air Peace (largest Nigerian airline)
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate
      };

      // Get flight schedules
      const response = await this.amadeus.schedule.flights.get(searchParams);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Amadeus flight schedules error:', error);
      const errorMessage = error.response?.body?.errors?.[0]?.detail || 
                          error.response?.description || 
                          error.message || 
                          'Unknown error retrieving flight schedules';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get major Nigerian airline codes
   * @returns List of major Nigerian airlines
   */
  getNigerianAirlines(): { code: string; name: string; logo?: string }[] {
    return [
      { 
        code: 'P4', 
        name: 'Air Peace',
        logo: 'https://upload.wikimedia.org/wikipedia/en/5/5f/Air_Peace_Logo.png'
      },
      { 
        code: 'W3', 
        name: 'Arik Air',
        logo: 'https://upload.wikimedia.org/wikipedia/en/8/88/Arik_Air_Logo.svg'
      },
      { 
        code: 'QI', 
        name: 'Ibom Air',
        logo: 'https://upload.wikimedia.org/wikipedia/en/c/c2/Ibom_Air_logo.svg'
      },
      { 
        code: 'EN', 
        name: 'Air Nigeria',
        logo: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Air_Nigeria_Logo.png'
      },
      { 
        code: 'VK', 
        name: 'Virgin Nigeria',
        logo: 'https://upload.wikimedia.org/wikipedia/en/0/0a/Virgin_Nigeria_logo.svg'
      }
    ];
  }

  /**
   * Get major Nigerian airports
   * @returns List of major Nigerian airports
   */
  getNigerianAirports(): { code: string; name: string; city: string; state: string }[] {
    return [
      { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', state: 'Lagos' },
      { code: 'ABV', name: 'Nnamdi Azikiwe International Airport', city: 'Abuja', state: 'FCT' },
      { code: 'PHC', name: 'Port Harcourt International Airport', city: 'Port Harcourt', state: 'Rivers' },
      { code: 'KAN', name: 'Mallam Aminu Kano International Airport', city: 'Kano', state: 'Kano' },
      { code: 'ENU', name: 'Akanu Ibiam International Airport', city: 'Enugu', state: 'Enugu' },
      { code: 'CBQ', name: 'Margaret Ekpo International Airport', city: 'Calabar', state: 'Cross River' },
      { code: 'QOW', name: 'Sam Mbakwe Airport', city: 'Owerri', state: 'Imo' },
      { code: 'BNI', name: 'Benin Airport', city: 'Benin City', state: 'Edo' },
      { code: 'SKO', name: 'Sadiq Abubakar III International Airport', city: 'Sokoto', state: 'Sokoto' },
      { code: 'MIU', name: 'Maiduguri International Airport', city: 'Maiduguri', state: 'Borno' },
      { code: 'JOS', name: 'Yakubu Gowon Airport', city: 'Jos', state: 'Plateau' },
      { code: 'ILR', name: 'Ilorin International Airport', city: 'Ilorin', state: 'Kwara' },
      { code: 'QUO', name: 'Akwa Ibom International Airport', city: 'Uyo', state: 'Akwa Ibom' }
    ];
  }
}

// Export singleton instance
export const amadeusService = new AmadeusService();