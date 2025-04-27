declare module 'amadeus' {
  export default class Amadeus {
    constructor(options: {
      clientId: string;
      clientSecret: string;
      hostname?: string;
      customAppId?: string;
      customAppVersion?: string;
      logger?: any;
      logLevel?: 'silent' | 'warn' | 'debug';
      ssl?: boolean;
      port?: number;
    });

    shopping: {
      flightOffersSearch: {
        get(params: any): Promise<any>;
      };
      flightOffers: {
        pricing: {
          post(body: string): Promise<any>;
        };
      };
    };

    referenceData: {
      locations: {
        get(params: any): Promise<any>;
        pointsOfInterest: {
          get(params: any): Promise<any>;
        };
      };
      airlines: {
        get(params: any): Promise<any>;
      };
    };

    schedule: {
      flights: {
        get(params: any): Promise<any>;
      };
    };
  }
}