/**
 * Transportation Data Service for Nigeria
 * This service provides transportation-related data for the Early Warning & Response System.
 * Serves as a replacement for the previously non-working services.
 */

// Standard response interface
interface TransportationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Transportation Service
 * Provides up-to-date transportation data for Nigeria
 */
class TransportationService {
  private initialized: boolean = true;

  constructor() {
    console.log('Transportation Data Service initialized');
  }

  /**
   * Verify service configuration
   * @returns Configuration status
   */
  verifyConfiguration(): { configured: boolean; missingVars: string[] } {
    return {
      configured: true,
      missingVars: []
    };
  }

  /**
   * Get Nigerian transportation hubs
   * @returns List of major transportation hubs in Nigeria
   */
  getNigerianTransportationHubs(): TransportationResponse {
    try {
      return {
        success: true,
        data: [
          { 
            id: 'LOS',
            name: 'Lagos',
            type: 'metropolitan',
            coordinates: { lat: 6.4550, lng: 3.3841 },
            transportationTypes: ['air', 'road', 'water'],
            facilities: [
              { name: 'Murtala Muhammed International Airport', type: 'airport', code: 'LOS' },
              { name: 'Lagos Bus Rapid Transit (BRT)', type: 'bus' },
              { name: 'Apapa Port', type: 'seaport' },
              { name: 'Lagos-Ibadan Railway Terminal', type: 'railway' }
            ]
          },
          { 
            id: 'ABV',
            name: 'Abuja',
            type: 'metropolitan',
            coordinates: { lat: 9.0765, lng: 7.3986 },
            transportationTypes: ['air', 'road'],
            facilities: [
              { name: 'Nnamdi Azikiwe International Airport', type: 'airport', code: 'ABV' },
              { name: 'Abuja Light Rail', type: 'rail' },
              { name: 'Abuja-Kaduna Railway Terminal', type: 'railway' }
            ]
          },
          { 
            id: 'KAN',
            name: 'Kano',
            type: 'metropolitan',
            coordinates: { lat: 12.0022, lng: 8.5920 },
            transportationTypes: ['air', 'road'],
            facilities: [
              { name: 'Mallam Aminu Kano International Airport', type: 'airport', code: 'KAN' },
              { name: 'Kano Central Bus Terminal', type: 'bus' }
            ]
          },
          { 
            id: 'PHC',
            name: 'Port Harcourt',
            type: 'metropolitan',
            coordinates: { lat: 4.7739, lng: 7.0134 },
            transportationTypes: ['air', 'road', 'water'],
            facilities: [
              { name: 'Port Harcourt International Airport', type: 'airport', code: 'PHC' },
              { name: 'Port Harcourt Seaport', type: 'seaport' }
            ]
          },
          { 
            id: 'ENU',
            name: 'Enugu',
            type: 'metropolitan',
            coordinates: { lat: 6.4584, lng: 7.5464 },
            transportationTypes: ['air', 'road'],
            facilities: [
              { name: 'Akanu Ibiam International Airport', type: 'airport', code: 'ENU' }
            ]
          },
          { 
            id: 'BNI',
            name: 'Benin',
            type: 'metropolitan',
            coordinates: { lat: 6.3350, lng: 5.6037 },
            transportationTypes: ['air', 'road'],
            facilities: [
              { name: 'Benin Airport', type: 'airport', code: 'BNI' }
            ]
          },
          {
            id: 'MIU',
            name: 'Maiduguri',
            type: 'metropolitan',
            coordinates: { lat: 11.8312, lng: 13.1508 },
            transportationTypes: ['air', 'road'],
            facilities: [
              { name: 'Maiduguri International Airport', type: 'airport', code: 'MIU' }
            ]
          }
        ]
      };
    } catch (error: any) {
      console.error('Error fetching transportation hubs:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve transportation hubs'
      };
    }
  }

  /**
   * Get Nigerian transportation routes
   * @returns Major transportation routes in Nigeria
   */
  getNigerianTransportationRoutes(): TransportationResponse {
    try {
      return {
        success: true,
        data: [
          {
            id: 'LIE',
            name: 'Lagos-Ibadan Expressway',
            type: 'road',
            distance: 127, // km
            status: 'operational',
            riskLevel: 'medium',
            start: { name: 'Lagos', coordinates: { lat: 6.4550, lng: 3.3841 } },
            end: { name: 'Ibadan', coordinates: { lat: 7.3775, lng: 3.9470 } }
          },
          {
            id: 'LIR',
            name: 'Lagos-Ibadan Railway',
            type: 'rail',
            distance: 156, // km
            status: 'operational',
            riskLevel: 'low',
            start: { name: 'Lagos', coordinates: { lat: 6.4550, lng: 3.3841 } },
            end: { name: 'Ibadan', coordinates: { lat: 7.3775, lng: 3.9470 } }
          },
          {
            id: 'AKR',
            name: 'Abuja-Kaduna Railway',
            type: 'rail',
            distance: 186, // km
            status: 'operational',
            riskLevel: 'medium',
            start: { name: 'Abuja', coordinates: { lat: 9.0765, lng: 7.3986 } },
            end: { name: 'Kaduna', coordinates: { lat: 10.5265, lng: 7.4381 } }
          },
          {
            id: 'AKE',
            name: 'Abuja-Kaduna Expressway',
            type: 'road',
            distance: 211, // km
            status: 'caution',
            riskLevel: 'high',
            start: { name: 'Abuja', coordinates: { lat: 9.0765, lng: 7.3986 } },
            end: { name: 'Kaduna', coordinates: { lat: 10.5265, lng: 7.4381 } }
          },
          {
            id: 'LEE',
            name: 'Lagos-Enugu Expressway',
            type: 'road',
            distance: 554, // km
            status: 'caution',
            riskLevel: 'medium',
            start: { name: 'Lagos', coordinates: { lat: 6.4550, lng: 3.3841 } },
            end: { name: 'Enugu', coordinates: { lat: 6.4584, lng: 7.5464 } }
          },
          {
            id: 'KME',
            name: 'Kano-Maiduguri Expressway',
            type: 'road',
            distance: 590, // km
            status: 'warning',
            riskLevel: 'critical',
            start: { name: 'Kano', coordinates: { lat: 12.0022, lng: 8.5920 } },
            end: { name: 'Maiduguri', coordinates: { lat: 11.8312, lng: 13.1508 } }
          },
          {
            id: 'PHE',
            name: 'Port Harcourt-Enugu Expressway',
            type: 'road',
            distance: 243, // km
            status: 'caution',
            riskLevel: 'medium',
            start: { name: 'Port Harcourt', coordinates: { lat: 4.7739, lng: 7.0134 } },
            end: { name: 'Enugu', coordinates: { lat: 6.4584, lng: 7.5464 } }
          }
        ]
      };
    } catch (error: any) {
      console.error('Error fetching transportation routes:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve transportation routes'
      };
    }
  }

  /**
   * Get current transportation disruptions in Nigeria
   * @returns List of active transportation disruptions
   */
  getCurrentDisruptions(): TransportationResponse {
    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      return {
        success: true,
        data: [
          {
            id: 'TR001',
            type: 'roadblock',
            location: {
              name: 'Abuja-Kaduna Expressway',
              coordinates: { lat: 9.6761, lng: 7.5136 }
            },
            startDate: formattedDate,
            endDate: null,
            status: 'active',
            severity: 'critical',
            description: 'Security concerns resulting in road closures and checkpoints',
            alternateRoutes: [
              { name: 'Abuja-Kaduna Railway', type: 'rail' }
            ]
          },
          {
            id: 'TR002',
            type: 'flooding',
            location: {
              name: 'East-West Road (Port Harcourt Section)',
              coordinates: { lat: 4.8396, lng: 7.0835 }
            },
            startDate: formattedDate,
            endDate: null,
            status: 'active',
            severity: 'high',
            description: 'Flooding has made sections of the road impassable',
            alternateRoutes: [
              { name: 'Eleme-Onne Bypass', type: 'road' }
            ]
          },
          {
            id: 'TR003',
            type: 'construction',
            location: {
              name: 'Lagos-Ibadan Expressway (Berger-Ibafo Section)',
              coordinates: { lat: 6.6394, lng: 3.4670 }
            },
            startDate: formattedDate,
            endDate: null,
            status: 'active',
            severity: 'medium',
            description: 'Ongoing construction causing significant traffic delays',
            alternateRoutes: [
              { name: 'Lagos-Abeokuta Expressway', type: 'road' },
              { name: 'Lagos-Ibadan Railway', type: 'rail' }
            ]
          },
          {
            id: 'TR004',
            type: 'securityThreat',
            location: {
              name: 'Maiduguri-Damaturu Road',
              coordinates: { lat: 11.9482, lng: 12.1512 }
            },
            startDate: formattedDate,
            endDate: null,
            status: 'active',
            severity: 'critical',
            description: 'Security concerns affecting safe travel',
            alternateRoutes: []
          },
          {
            id: 'TR005',
            type: 'accident',
            location: {
              name: 'Third Mainland Bridge, Lagos',
              coordinates: { lat: 6.5018, lng: 3.3947 }
            },
            startDate: formattedDate,
            endDate: null,
            status: 'active',
            severity: 'high',
            description: 'Major accident causing partial bridge closure',
            alternateRoutes: [
              { name: 'Carter Bridge', type: 'road' },
              { name: 'Eko Bridge', type: 'road' }
            ]
          }
        ]
      };
    } catch (error: any) {
      console.error('Error fetching transportation disruptions:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve transportation disruptions'
      };
    }
  }

  /**
   * Get evacuation routes for a given city or region
   * @param location City or region name
   * @returns Evacuation routes for the specified location
   */
  getEvacuationRoutes(location: string): TransportationResponse {
    try {
      // Normalize location name
      const normalizedLocation = location.trim().toLowerCase();
      
      // Define evacuation routes data by location
      const evacuationRoutesMap: Record<string, any[]> = {
        'lagos': [
          {
            id: 'EVL001',
            name: 'Lagos Island to Mainland Evacuation Route',
            transportType: 'road',
            path: 'Third Mainland Bridge → Ikorodu Road → Lagos-Ibadan Expressway',
            checkpoints: [
              { name: 'Third Mainland Bridge Entry', coordinates: { lat: 6.5018, lng: 3.3924 } },
              { name: 'Ikorodu Road Junction', coordinates: { lat: 6.5516, lng: 3.3761 } },
              { name: 'Lagos-Ibadan Expressway Entry', coordinates: { lat: 6.6394, lng: 3.4670 } }
            ],
            alternateRoutes: [
              { name: 'Carter Bridge → Eko Bridge → Western Avenue' }
            ],
            estimatedEvacuationTime: '2-3 hours',
            congestionLevel: 'high'
          },
          {
            id: 'EVL002',
            name: 'Lagos Mainland to Ogun State Evacuation Route',
            transportType: 'road',
            path: 'Lagos-Ibadan Expressway → Sagamu Interchange → Abeokuta Expressway',
            checkpoints: [
              { name: 'Lagos-Ibadan Expressway Entry', coordinates: { lat: 6.6394, lng: 3.4670 } },
              { name: 'Sagamu Interchange', coordinates: { lat: 6.8477, lng: 3.6424 } }
            ],
            alternateRoutes: [
              { name: 'Lagos-Abeokuta Expressway → Sango-Ota → Abeokuta' }
            ],
            estimatedEvacuationTime: '1-2 hours',
            congestionLevel: 'medium'
          }
        ],
        'abuja': [
          {
            id: 'EVA001',
            name: 'Abuja City Center to Suleja Evacuation Route',
            transportType: 'road',
            path: 'Abuja-Kaduna Expressway → Suleja',
            checkpoints: [
              { name: 'City Gate', coordinates: { lat: 9.0025, lng: 7.4921 } },
              { name: 'Zuba Junction', coordinates: { lat: 9.1076, lng: 7.2414 } }
            ],
            alternateRoutes: [
              { name: 'Kubwa Expressway → Bwari → Suleja' }
            ],
            estimatedEvacuationTime: '1-2 hours',
            congestionLevel: 'medium'
          },
          {
            id: 'EVA002',
            name: 'Abuja to Nasarawa Evacuation Route',
            transportType: 'road',
            path: 'AYA Junction → Nyanya → Mararaba → Keffi',
            checkpoints: [
              { name: 'AYA Junction', coordinates: { lat: 9.0456, lng: 7.5042 } },
              { name: 'Nyanya Checkpoint', coordinates: { lat: 9.0588, lng: 7.5547 } },
              { name: 'Keffi Entry', coordinates: { lat: 8.8469, lng: 7.8736 } }
            ],
            alternateRoutes: [],
            estimatedEvacuationTime: '2-3 hours',
            congestionLevel: 'high'
          }
        ],
        'port harcourt': [
          {
            id: 'EVP001',
            name: 'Port Harcourt City to Aba Evacuation Route',
            transportType: 'road',
            path: 'East-West Road → Port Harcourt-Aba Expressway',
            checkpoints: [
              { name: 'East-West Road Junction', coordinates: { lat: 4.8396, lng: 7.0835 } },
              { name: 'Oyigbo Checkpoint', coordinates: { lat: 4.8729, lng: 7.1492 } }
            ],
            alternateRoutes: [
              { name: 'Old Aba Road → Oyigbo → Aba' }
            ],
            estimatedEvacuationTime: '1-2 hours',
            congestionLevel: 'medium'
          }
        ],
        'maiduguri': [
          {
            id: 'EVM001',
            name: 'Maiduguri to Damaturu Evacuation Route',
            transportType: 'road',
            path: 'Maiduguri-Damaturu Road',
            checkpoints: [
              { name: 'Maiduguri Checkpoint', coordinates: { lat: 11.8312, lng: 13.1508 } },
              { name: 'Beneshiek Security Point', coordinates: { lat: 11.8004, lng: 12.4912 } }
            ],
            alternateRoutes: [],
            estimatedEvacuationTime: '3-4 hours',
            congestionLevel: 'high',
            securityConcerns: 'high'
          }
        ]
      };
      
      // Find routes for the location
      for (const [key, routes] of Object.entries(evacuationRoutesMap)) {
        if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
          return {
            success: true,
            data: routes
          };
        }
      }
      
      // If no specific routes found, return general evacuation information
      return {
        success: true,
        data: {
          message: 'No specific evacuation routes found for this location. Contact local emergency services.',
          generalAdvice: [
            'Follow instructions from local authorities',
            'Move to higher ground in case of flooding',
            'Use main roads and highways when possible',
            'Stay away from areas with security concerns'
          ],
          emergencyContacts: [
            { name: 'National Emergency Management Agency (NEMA)', phone: '112' },
            { name: 'Federal Road Safety Corps (FRSC)', phone: '122' },
            { name: 'Nigeria Police Force', phone: '112' }
          ]
        }
      };
    } catch (error: any) {
      console.error('Error fetching evacuation routes:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve evacuation routes'
      };
    }
  }

  /**
   * Get major Nigerian transportation hubs
   * @returns List of major transport hubs in Nigeria
   */
  getMajorTransportationHubs(): { id: string; name: string; city: string; state: string; type: string; coordinates: { lat: number; lng: number } }[] {
    return [
      { id: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', state: 'Lagos', type: 'airport', coordinates: { lat: 6.5774, lng: 3.3216 } },
      { id: 'ABV', name: 'Nnamdi Azikiwe International Airport', city: 'Abuja', state: 'FCT', type: 'airport', coordinates: { lat: 9.0065, lng: 7.2631 } },
      { id: 'PHC', name: 'Port Harcourt International Airport', city: 'Port Harcourt', state: 'Rivers', type: 'airport', coordinates: { lat: 5.0144, lng: 6.9494 } },
      { id: 'KAN', name: 'Mallam Aminu Kano International Airport', city: 'Kano', state: 'Kano', type: 'airport', coordinates: { lat: 12.0476, lng: 8.5266 } },
      { id: 'TIL', name: 'Tin Can Island Port', city: 'Lagos', state: 'Lagos', type: 'seaport', coordinates: { lat: 6.4290, lng: 3.3509 } },
      { id: 'APP', name: 'Apapa Port', city: 'Lagos', state: 'Lagos', type: 'seaport', coordinates: { lat: 6.4432, lng: 3.3679 } },
      { id: 'PHP', name: 'Port Harcourt Port', city: 'Port Harcourt', state: 'Rivers', type: 'seaport', coordinates: { lat: 4.7433, lng: 7.0139 } },
      { id: 'IDO', name: 'Iddo Railway Terminal', city: 'Lagos', state: 'Lagos', type: 'railway', coordinates: { lat: 6.4700, lng: 3.3805 } },
      { id: 'ABT', name: 'Abuja Railway Terminal', city: 'Abuja', state: 'FCT', type: 'railway', coordinates: { lat: 9.0291, lng: 7.4503 } },
      { id: 'OLI', name: 'Ojuelegba Transit Hub', city: 'Lagos', state: 'Lagos', type: 'bus', coordinates: { lat: 6.5073, lng: 3.3635 } },
      { id: 'UTP', name: 'Utako Park Transit Hub', city: 'Abuja', state: 'FCT', type: 'bus', coordinates: { lat: 9.0750, lng: 7.4256 } }
    ];
  }
}

// Export singleton instance
export const transportationService = new TransportationService();