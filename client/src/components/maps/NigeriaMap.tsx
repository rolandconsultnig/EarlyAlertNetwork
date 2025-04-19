import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import { Incident } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, AlertCircle, MapPin, Users } from 'lucide-react';

// Fix Leaflet marker icon issues
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom icons for different incident types
const highSeverityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mediumSeverityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const lowSeverityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Nigeria map bounds to restrict panning
const nigeriaBounds = L.latLngBounds(
  L.latLng(4.0, 2.5), // Southwest corner
  L.latLng(14.0, 15.0) // Northeast corner
);

// Component to set the map bounds
function SetBoundsRectangles() {
  const map = useMap();
  
  useEffect(() => {
    // Set max bounds to Nigeria
    map.setMaxBounds(nigeriaBounds);
    map.options.minZoom = 6;
    map.options.maxBoundsViscosity = 1.0;
    
    // Center the map on Nigeria
    map.fitBounds(nigeriaBounds);
    
    // Disable keyboard navigation which can move out of bounds
    map.keyboard.disable();
  }, [map]);
  
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onClick
  });
  return null;
}

// Interface for map props
interface NigeriaMapProps {
  height?: string;
  showIncidents?: boolean;
  showAddIncidentButton?: boolean;
  onAddIncident?: (lat: number, lng: number) => void;
  incidents?: Incident[];
}

// Custom interface for mock incidents data
interface MockIncident {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: string;
  status: string;
  region: string;
  location?: string;
  impactedPopulation?: number;
  category?: string;
}

// Mock incidents data for testing if no incidents are provided
const mockIncidents: MockIncident[] = [
  {
    id: 1,
    title: "Farmer-Herder Clash in Benue",
    description: "Violent clash between farmers and herders in Makurdi area with multiple casualties reported",
    latitude: 7.7322,
    longitude: 8.5391,
    severity: "high",
    status: "active",
    region: "North Central",
    location: "Makurdi, Benue State",
    impactedPopulation: 12450,
    category: "violence"
  },
  {
    id: 2,
    title: "Flooding in Lagos",
    description: "Severe flooding affecting multiple communities in Lagos State with residential areas submerged",
    latitude: 6.5244,
    longitude: 3.3792,
    severity: "medium",
    status: "active",
    region: "South West",
    location: "Victoria Island, Lagos State",
    impactedPopulation: 35200,
    category: "natural_disaster"
  },
  {
    id: 3,
    title: "Protest in Kano",
    description: "Civil unrest in Kano metropolitan area with demonstrations against government policies",
    latitude: 12.0022,
    longitude: 8.5920,
    severity: "low",
    status: "resolved",
    region: "North West",
    location: "Kano City, Kano State",
    impactedPopulation: 15800,
    category: "civil_unrest"
  },
  {
    id: 4,
    title: "Terrorist Attack in Maiduguri",
    description: "Multiple explosions reported in the city center with civilian casualties",
    latitude: 11.8311,
    longitude: 13.1510,
    severity: "high",
    status: "active",
    region: "North East",
    location: "Maiduguri, Borno State",
    impactedPopulation: 28750,
    category: "terrorism"
  },
  {
    id: 5,
    title: "School Kidnapping in Kaduna",
    description: "Armed group abducted students from a boarding school during night hours",
    latitude: 10.5167,
    longitude: 7.4333,
    severity: "high",
    status: "active",
    region: "North West",
    location: "Kaduna, Kaduna State",
    impactedPopulation: 342,
    category: "kidnapping"
  },
  {
    id: 6,
    title: "Oil Pipeline Vandalism",
    description: "Major oil pipeline damaged by suspected militants causing environmental damage",
    latitude: 5.0149,
    longitude: 6.9830,
    severity: "medium",
    status: "active",
    region: "South South",
    location: "Port Harcourt, Rivers State",
    impactedPopulation: 8500,
    category: "infrastructure"
  },
  {
    id: 7,
    title: "Communal Clash in Enugu",
    description: "Violent conflict between neighboring communities over land dispute",
    latitude: 6.4402,
    longitude: 7.4994,
    severity: "medium",
    status: "active",
    region: "South East",
    location: "Enugu, Enugu State",
    impactedPopulation: 5750,
    category: "violence"
  },
  {
    id: 8,
    title: "Market Fire in Ibadan",
    description: "Major fire outbreak in a crowded market destroyed dozens of shops and goods",
    latitude: 7.3775,
    longitude: 3.9470,
    severity: "medium",
    status: "resolved",
    region: "South West",
    location: "Ibadan, Oyo State",
    impactedPopulation: 3200,
    category: "fire"
  },
  {
    id: 9,
    title: "Cholera Outbreak in Sokoto",
    description: "Health emergency declared due to rapidly spreading cholera cases in rural areas",
    latitude: 13.0622,
    longitude: 5.2339,
    severity: "high",
    status: "active",
    region: "North West",
    location: "Sokoto, Sokoto State",
    impactedPopulation: 4562,
    category: "health_crisis"
  },
  {
    id: 10,
    title: "Building Collapse in Abuja",
    description: "Multi-story building under construction collapsed with workers trapped inside",
    latitude: 9.0765,
    longitude: 7.3986,
    severity: "medium",
    status: "active",
    region: "Federal Capital Territory",
    location: "Abuja, FCT",
    impactedPopulation: 87,
    category: "infrastructure"
  },
  {
    id: 11,
    title: "Armed Robbery in Aba",
    description: "Coordinated bank robberies across the city resulted in security lockdown",
    latitude: 5.1215,
    longitude: 7.3698,
    severity: "medium", 
    status: "resolved",
    region: "South East",
    location: "Aba, Abia State",
    impactedPopulation: 2850,
    category: "crime"
  },
  {
    id: 12,
    title: "Prison Break in Jos",
    description: "Mass escape of inmates from correctional facility following external attack",
    latitude: 9.8965,
    longitude: 8.8583, 
    severity: "high",
    status: "active",
    region: "North Central",
    location: "Jos, Plateau State",
    impactedPopulation: 11250,
    category: "security"
  }
];

export default function NigeriaMap({
  height = "500px",
  showIncidents = true,
  showAddIncidentButton = false,
  onAddIncident,
  incidents: propIncidents
}: NigeriaMapProps) {
  const [clickedPosition, setClickedPosition] = useState<[number, number] | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  // Ensure map stability by tracking when it's fully loaded
  useEffect(() => {
    // Set a flag once component is mounted to prevent markers from disappearing
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch incidents from API if none provided as props
  const { data: fetchedIncidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
    enabled: showIncidents && !propIncidents && mapReady,
  });
  
  // Use provided incidents or fetched incidents or mock data
  // Only use mock incidents after map is ready to ensure they don't disappear
  const incidents = mapReady ? (propIncidents || fetchedIncidents || mockIncidents) : [];
  
  // Get icon based on severity
  const getIncidentIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return highSeverityIcon;
      case 'medium':
        return mediumSeverityIcon;
      case 'low':
        return lowSeverityIcon;
      default:
        return defaultIcon;
    }
  };
  
  // Handle map click for adding incident
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!showAddIncidentButton) return;
    
    const { lat, lng } = e.latlng;
    setClickedPosition([lat, lng]);
    setShowConfirmation(true);
  };
  
  // Confirm adding an incident
  const confirmAddIncident = () => {
    if (!clickedPosition || !onAddIncident) return;
    
    onAddIncident(clickedPosition[0], clickedPosition[1]);
    setClickedPosition(null);
    setShowConfirmation(false);
  };
  
  // Get coordinates from an incident
  const getCoordinates = (incident: Incident | MockIncident): [number, number] => {
    // For mock incidents with predefined coordinates
    if ('latitude' in incident && 'longitude' in incident) {
      return [incident.latitude, incident.longitude];
    }
    
    // For regular incidents, try to extract coordinates from coordinates JSON string
    if ('coordinates' in incident && incident.coordinates) {
      try {
        const coords = JSON.parse(incident.coordinates as string);
        if (coords.lat && coords.lng) {
          return [coords.lat, coords.lng];
        }
      } catch (e) {
        console.error("Failed to parse JSON coordinates", e);
      }
    }
    
    // For regular incidents, try to extract coordinates from location string as fallback
    if ('location' in incident && incident.location && typeof incident.location === 'string' && incident.location.includes(',')) {
      try {
        const [lat, lng] = incident.location.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      } catch (e) {
        console.error("Failed to parse location coordinates", e);
      }
    }
    
    console.log("Using default coordinates for incident:", incident.title);
    // Default to center of Nigeria if no valid coordinates found
    return [9.0765, 7.3986];
  };
  
  return (
    <div style={{ height, position: 'relative', zIndex: 1 }}>
      <MapContainer 
        center={[9.0765, 7.3986]} 
        zoom={6} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        maxBoundsViscosity={1.0}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <SetBoundsRectangles />
        
        {/* Map click handler */}
        {showAddIncidentButton && (
          <MapClickHandler onClick={handleMapClick} />
        )}
        
        {/* Display incidents on the map */}
        {showIncidents && incidents?.map((incident) => {
          const [lat, lng] = getCoordinates(incident);
          
          return (
            <Marker 
              key={incident.id}
              position={[lat, lng]}
              icon={getIncidentIcon(incident.severity)}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-2">
                  <div className="font-bold text-lg text-red-600 mb-2">{incident.title}</div>
                  <p className="text-sm mb-3">{incident.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center text-xs p-1 bg-amber-50 rounded">
                      <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
                      <span className="font-semibold">Severity:</span> 
                      <Badge variant={incident.severity === 'high' ? 'destructive' : (incident.severity === 'medium' ? 'secondary' : 'default')} 
                        className="ml-1">
                        {incident.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs p-1 bg-slate-50 rounded">
                      <Info className="h-3 w-3 mr-1 text-slate-600" />
                      <span className="font-semibold">Status:</span> 
                      <Badge variant={incident.status === 'active' ? 'outline' : 'secondary'} 
                        className="ml-1">
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-xs">
                      <MapPin className="h-3 w-3 mr-1 text-blue-600" />
                      <span className="font-semibold">Location:</span> 
                      <span className="ml-1">
                        {('location' in incident) ? incident.location : 
                         ('latitude' in incident) ? `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}` : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <AlertCircle className="h-3 w-3 mr-1 text-green-600" />
                      <span className="font-semibold">Region:</span>
                      <span className="ml-1">{incident.region}</span>
                    </div>
                    {'impactedPopulation' in incident && (
                      <div className="flex items-center text-xs">
                        <AlertCircle className="h-3 w-3 mr-1 text-purple-600" />
                        <span className="font-semibold">Population Affected:</span>
                        <span className="ml-1">{(incident as any).impactedPopulation?.toLocaleString() || 'Unknown'}</span>
                      </div>
                    )}
                    {'category' in incident && (
                      <div className="flex items-center text-xs">
                        <AlertCircle className="h-3 w-3 mr-1 text-orange-600" />
                        <span className="font-semibold">Category:</span>
                        <span className="ml-1 capitalize">{(incident as any).category?.replace('_', ' ') || 'Unclassified'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1 text-xs h-7" variant="default">
                      View Details
                    </Button>
                    <Button className="flex-1 text-xs h-7" variant="outline">
                      Response Plan
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Show pin for location being added */}
        {clickedPosition && (
          <Marker position={clickedPosition}>
            <Popup>
              <div className="p-1">
                <p className="text-sm mb-2">Add a new incident at this location?</p>
                <p className="text-xs mb-2">Coordinates: {clickedPosition[0].toFixed(4)}, {clickedPosition[1].toFixed(4)}</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    className="text-xs h-7 flex-1"
                    onClick={confirmAddIncident}
                  >
                    Confirm
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 flex-1"
                    onClick={() => {
                      setClickedPosition(null);
                      setShowConfirmation(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Show risk heatmap for Nigeria */}
        {showIncidents && incidents?.filter(i => i.severity === 'high').map((incident, idx) => {
          const [lat, lng] = getCoordinates(incident);
          
          return (
            <Circle 
              key={`heat-${incident.id}-${idx}`}
              center={[lat, lng]}
              radius={50000}
              pathOptions={{ fillColor: 'red', fillOpacity: 0.2, weight: 0 }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}