import { twilioService } from './twilio-service';
import { twitterService } from './twitter-service';
import { facebookService } from './facebook-service';
import { instagramService } from './instagram-service';
import { amadeusService } from './amadeus-service';

/**
 * Social Media and Communication Integration Services
 * This module provides interfaces to multiple communication channels
 * for the Early Warning & Early Response System.
 */
export const integrationServices = {
  // SMS/WhatsApp Integration
  twilio: twilioService,

  // Social Media Integrations
  twitter: twitterService,  // X/Twitter integration
  facebook: facebookService,
  instagram: instagramService,
  
  // Travel & Transportation Integration
  amadeus: amadeusService,  // Flight and airport information (replaces Dana Air)

  /**
   * Check status of all integration services
   * Returns the configuration status of each service
   */
  checkStatus(): { [key: string]: { configured: boolean; missingVars: string[] } } {
    return {
      twilio: twilioService.verifyConfiguration(),
      twitter: twitterService.verifyConfiguration(),
      facebook: facebookService.verifyConfiguration(), 
      instagram: instagramService.verifyConfiguration(),
      amadeus: amadeusService.verifyConfiguration()
    };
  }
};

export default integrationServices;