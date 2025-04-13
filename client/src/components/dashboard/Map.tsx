import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Layers, Maximize } from "lucide-react";

// Fix Leaflet marker icon issues
const MarkerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RiskPoint {
  id: number;
  position: [number, number]; // [lat, lng]
  title: string;
  risk: 'high' | 'medium' | 'low';
}

interface MapViewProps {
  riskPoints?: RiskPoint[];
  center?: [number, number];
  zoom?: number;
}

function ZoomControl() {
  const map = useMap();
  
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-[1000]">
      <div className="flex flex-col space-y-2">
        <Button variant="ghost" size="icon" className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded" onClick={handleZoomIn}>
          <Plus className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded" onClick={handleZoomOut}>
          <Minus className="h-5 w-5" />
        </Button>
        <div className="border-t border-neutral-200 my-1"></div>
        <Button variant="ghost" size="icon" className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded">
          <Layers className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default function MapView({ 
  riskPoints = [], 
  center = [0, 0], 
  zoom = 3 
}: MapViewProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return '#D32F2F'; // Error red
      case 'medium':
        return '#F57C00'; // Warning orange
      case 'low':
        return '#2E7D32'; // Success green
      default:
        return '#0288D1'; // Info blue
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow border border-neutral-200 overflow-hidden">
      <CardHeader className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="font-medium text-lg">Risk Heatmap</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="p-1.5 text-neutral-500 hover:text-neutral-700 rounded">
            <Layers className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="p-1.5 text-neutral-500 hover:text-neutral-700 rounded">
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 relative">
          <MapContainer 
            center={center} 
            zoom={zoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {riskPoints.map((point) => (
              <CircleMarker
                key={point.id}
                center={point.position}
                radius={8}
                pathOptions={{ 
                  fillColor: getRiskColor(point.risk),
                  color: getRiskColor(point.risk),
                  fillOpacity: 0.8,
                  weight: 2
                }}
              >
                <Popup>{point.title}</Popup>
              </CircleMarker>
            ))}
            
            <ZoomControl />
          </MapContainer>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
            <div className="text-sm font-medium mb-2">Risk Level</div>
            <div className="flex items-center space-x-2">
              <span className="block w-4 h-4 rounded-full bg-red-600"></span>
              <span className="text-sm">High</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="block w-4 h-4 rounded-full bg-amber-500"></span>
              <span className="text-sm">Medium</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="block w-4 h-4 rounded-full bg-green-700"></span>
              <span className="text-sm">Low</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
