import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import { Incident } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
}

// Mock incidents data for testing if no incidents are provided
const mockIncidents: MockIncident[] = [
  {
    id: 1,
    title: "Farmer-Herder Clash in Benue",
    description: "Violent clash between farmers and herders in Makurdi area",
    latitude: 7.7322,
    longitude: 8.5391,
    severity: "high",
    status: "active",
    region: "North Central"
  },
  {
    id: 2,
    title: "Flooding in Lagos",
    description: "Severe flooding affecting multiple communities in Lagos State",
    latitude: 6.5244,
    longitude: 3.3792,
    severity: "medium",
    status: "active",
    region: "South West"
  },
  {
    id: 3,
    title: "Protest in Kano",
    description: "Civil unrest in Kano metropolitan area",
    latitude: 12.0022,
    longitude: 8.5920,
    severity: "low",
    status: "resolved",
    region: "North West"
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
  
  // Fetch incidents from API if none provided as props
  const { data: fetchedIncidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
    enabled: showIncidents && !propIncidents,
  });
  
  // Use provided incidents or fetched incidents or mock data
  const incidents = propIncidents || fetchedIncidents || mockIncidents;
  
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
    
    // For regular incidents, try to extract coordinates from location string
    if ('location' in incident && incident.location && incident.location.includes(',')) {
      try {
        const [lat, lng] = incident.location.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      } catch (e) {
        console.error("Failed to parse location coordinates", e);
      }
    }
    
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
              <Popup className="custom-popup">
                <div className="p-1">
                  <div className="font-bold mb-1">{incident.title}</div>
                  <p className="text-sm mb-2">{incident.description}</p>
                  <div className="flex items-center text-xs mb-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>Severity: {incident.severity}</span>
                  </div>
                  <div className="flex items-center text-xs mb-1">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Status: {incident.status}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>Region: {incident.region}</span>
                  </div>
                  <Button className="w-full mt-2 text-xs h-7">View Details</Button>
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