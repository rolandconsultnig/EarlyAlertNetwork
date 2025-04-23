import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Loader2, Map, Satellite } from "lucide-react";
import NigeriaMap from "@/components/maps/NigeriaMap";
import SatelliteImagery from "@/components/map/SatelliteImagery";
import type { Incident } from "@shared/schema";

// Create our own mock incidents with custom properties for the map display
// Each mock incident needs to have the required fields to match the NigeriaMap component's expectations
// This is a separate interface just for our map page
interface MapMockIncident {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number; 
  severity: string;
  status: string;
  region: string;
  location: string;
  impactedPopulation?: number;
  category?: string;
  // Adding properties needed by the Incident type
  reportedAt: Date;
  reportedBy: number;
  coordinates?: string;
  state: string | null;
  lga: string | null;
  sourceId: number | null;
  mediaUrls: string[] | null;
  relatedIndicators: string[] | null;
  verificationStatus: string;
}

// Define mock incidents that follow the structure required by the NigeriaMap component
const mockIncidents: MapMockIncident[] = [
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
    state: "Benue",
    lga: "Makurdi",
    impactedPopulation: 12450,
    category: "violence",
    reportedAt: new Date(),
    reportedBy: 1,
    sourceId: null,
    mediaUrls: null,
    relatedIndicators: null,
    verificationStatus: "verified"
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
    state: "Lagos",
    lga: "Eti-Osa",
    impactedPopulation: 35200,
    category: "natural_disaster",
    reportedAt: new Date(),
    reportedBy: 1,
    sourceId: null,
    mediaUrls: null,
    relatedIndicators: null,
    verificationStatus: "verified"
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
    state: "Kano",
    lga: "Kano Municipal",
    impactedPopulation: 15800,
    category: "civil_unrest",
    reportedAt: new Date(),
    reportedBy: 1,
    sourceId: null,
    mediaUrls: null,
    relatedIndicators: null,
    verificationStatus: "verified"
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
    state: "Borno",
    lga: "Maiduguri",
    impactedPopulation: 28750,
    category: "terrorism",
    reportedAt: new Date(),
    reportedBy: 1,
    sourceId: null,
    mediaUrls: null,
    relatedIndicators: null,
    verificationStatus: "verified"
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
    state: "Kaduna",
    lga: "Kaduna South",
    impactedPopulation: 342,
    category: "kidnapping",
    reportedAt: new Date(),
    reportedBy: 1,
    sourceId: null,
    mediaUrls: null,
    relatedIndicators: null,
    verificationStatus: "verified"
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
    state: "Rivers",
    lga: "Port Harcourt",
    impactedPopulation: 8500,
    category: "infrastructure",
    reportedAt: new Date(),
    reportedBy: 1,
    sourceId: null,
    mediaUrls: null,
    relatedIndicators: null,
    verificationStatus: "verified"
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
    state: "Enugu",
    lga: "Enugu North",
    impactedPopulation: 5750,
    category: "violence",
    reportedAt: new Date(),
    reportedBy: 1,
    sourceId: null,
    mediaUrls: null,
    relatedIndicators: null,
    verificationStatus: "verified"
  }
];

export default function MapPage() {
  const [mapHeight, setMapHeight] = useState("700px");
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<MapMockIncident | null>(null);
  const [activeTab, setActiveTab] = useState<string>("map");
  
  // Add stability to make sure the map doesn't disappear
  useEffect(() => {
    // Short delay to ensure the map is properly mounted
    const timer = setTimeout(() => {
      setIsMapReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle incident selection to view corresponding satellite imagery
  const handleIncidentSelect = (incident: MapMockIncident) => {
    setSelectedIncident(incident);
    setSelectedLocation({ 
      lat: incident.latitude, 
      lng: incident.longitude 
    });
    
    // Switch to satellite tab
    setActiveTab("satellite");
  };
  
  return (
    <MainLayout title="Crisis Map">
      <Card className="shadow-lg">
        <CardHeader className="p-6 pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Nigeria Crisis Map (All Regions)</CardTitle>
              <CardDescription>
                Comprehensive view of incidents across all Nigerian regions
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMapHeight(mapHeight === "700px" ? "500px" : "700px")}
              >
                {mapHeight === "700px" ? "Reduce" : "Expand"} Map
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="map" className="flex items-center">
                <Map className="h-4 w-4 mr-2" />
                Crisis Map
              </TabsTrigger>
              <TabsTrigger value="satellite" className="flex items-center">
                <Satellite className="h-4 w-4 mr-2" />
                Satellite Imagery
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="border rounded-md overflow-hidden" style={{ position: 'relative', zIndex: 5 }}>
              {!isMapReady ? (
                <div style={{ height: mapHeight }} className="flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-sm text-gray-500">Loading map and incidents...</p>
                  </div>
                </div>
              ) : (
                <div className="map-wrapper">
                  <NigeriaMap 
                    height={mapHeight}
                    showIncidents={true}
                    incidents={mockIncidents as unknown as Incident[]}
                    onSelectIncident={(incident) => handleIncidentSelect(incident as unknown as MapMockIncident)}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="satellite">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SatelliteImagery location={selectedLocation} />
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    {selectedIncident ? (
                      <>Satellite Analysis: {selectedIncident.title}</>
                    ) : (
                      <>Satellite Imagery Analysis</>
                    )}
                  </h3>
                  
                  {selectedIncident ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Viewing satellite imagery for the area around <strong>{selectedIncident.location || `${selectedIncident.latitude.toFixed(4)}, ${selectedIncident.longitude.toFixed(4)}`}</strong>.
                      </p>
                      
                      <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                        <h4 className="font-medium text-sm text-blue-700 mb-1">Incident Details</h4>
                        <div className="space-y-1 text-xs">
                          <div><span className="font-medium">Type:</span> {selectedIncident.category?.replace('_', ' ') || 'Unclassified'}</div>
                          <div><span className="font-medium">Severity:</span> {selectedIncident.severity}</div>
                          <div><span className="font-medium">Status:</span> {selectedIncident.status}</div>
                          <div><span className="font-medium">Region:</span> {selectedIncident.region}</div>
                          <div><span className="font-medium">Affected Population:</span> {selectedIncident.impactedPopulation?.toLocaleString() || 'Unknown'}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Choose different satellite sources to compare imagery and assess the geographic context of this incident. USGS Earth Explorer imagery is automatically requested for the incident coordinates.
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        Satellite imagery provides critical insights for monitoring and analyzing conflict zones, environmental changes, population movements, and infrastructure damage.
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <h4 className="font-medium">Available Data Sources:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Landsat 8/9 - Medium resolution imagery for environmental monitoring</li>
                          <li>Sentinel-2 - High resolution optical imagery with 10-60m resolution</li>
                          <li>MODIS - Daily global coverage at 250-1000m resolution</li>
                        </ul>
                        
                        <h4 className="font-medium mt-4">Applications:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Early warning of environmental triggers for conflicts</li>
                          <li>Monitoring of population displacements</li>
                          <li>Assessment of infrastructure damage following incidents</li>
                          <li>Verification of reported incidents and conflict zones</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Map Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-red-500"></div>
            <span>High Severity Incidents</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-amber-500"></div>
            <span>Medium Severity Incidents</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-500"></div>
            <span>Low Severity Incidents</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Click on any marker to view detailed information about the incident, including severity, 
            status, location, population affected, and incident category.
          </p>
          
          <div className="mt-6 pt-4 border-t text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Institute for Peace and Conflict Resolution. All rights reserved.</p>
            <p className="mt-1">Designed by <a href="https://afrinict.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">afrinict.com</a></p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}