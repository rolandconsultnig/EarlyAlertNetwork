import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Satellite, Download, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';

interface SatelliteImageryProps {
  className?: string;
  location?: { lat: number; lng: number };
  onImageLoad?: (imageUrl: string) => void;
}

interface SatelliteSource {
  id: number;
  name: string;
  type: string;
  url?: string;
  description?: string;
}

const SatelliteImagery: React.FC<SatelliteImageryProps> = ({ 
  className, 
  location = { lat: 9.0820, lng: 8.6753 }, // Default center of Nigeria
  onImageLoad 
}) => {
  const { toast } = useToast();
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [opacity, setOpacity] = useState<number>(100);
  
  // Fetch satellite data sources
  const { data: satelliteSources, isLoading: isLoadingSources } = useQuery({
    queryKey: ['/api/data-sources'],
    select: (data: SatelliteSource[]) => 
      data.filter((source: SatelliteSource) => source.type === 'satellite')
  });

  // Simulated satellite image URLs for demonstration
  // In a real implementation, these would be actual URLs to satellite imagery
  const sampleImages = {
    'Sentinel-2': 'https://www.evernaconsulting.com/wp-content/uploads/2020/07/Nigeria-Urban-Growth-Analytics-Spatial-Planning-scaled.jpg',
    'Landsat 8/9': 'https://www.nesdis.noaa.gov/sites/default/files/assets/images/nigeria-landsat.jpg',
    'MODIS': 'https://eoimages.gsfc.nasa.gov/images/imagerecords/92000/92674/nigeria_viirs_2016_lrg.jpg',
    'Satellite Imagery': 'https://www.evernaconsulting.com/wp-content/uploads/2020/07/Nigeria-Urban-Growth-Analytics-Spatial-Planning-scaled.jpg',
  };

  // Function to fetch satellite imagery (simulated)
  const fetchSatelliteImage = async (sourceId: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would make an API call to fetch actual imagery
      // For now, we're using sample images
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const source = satelliteSources?.find((s: SatelliteSource) => s.id.toString() === sourceId);
      
      if (!source) {
        throw new Error('Invalid satellite source');
      }
      
      // Use the sample image by source name, or fall back to a default
      const imageUrl = sampleImages[source.name as keyof typeof sampleImages] || sampleImages['Satellite Imagery'];
      
      setCurrentImage(imageUrl);
      if (onImageLoad) onImageLoad(imageUrl);
      
      toast({
        title: 'Imagery Loaded',
        description: `Successfully loaded imagery from ${source.name}`,
      });
    } catch (error) {
      console.error('Error loading satellite imagery:', error);
      toast({
        title: 'Error',
        description: 'Failed to load satellite imagery. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle source selection change
  const handleSourceChange = (value: string) => {
    setSelectedSource(value);
    fetchSatelliteImage(value);
  };
  
  // Handle zoom operations
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  
  // Handle opacity change
  const handleOpacityChange = (value: number[]) => {
    setOpacity(value[0]);
  };
  
  // Update the image when location changes (not implemented in this demo)
  useEffect(() => {
    if (selectedSource && location) {
      // In a real implementation, this would re-fetch the imagery for the new location
      // console.log('Location changed, would fetch new imagery for:', location);
    }
  }, [location, selectedSource]);
  
  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Satellite className="mr-2 h-5 w-5" />
          Satellite Imagery
        </CardTitle>
        <CardDescription>
          View satellite imagery for conflict monitoring and analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Satellite Source</label>
          {isLoadingSources ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedSource} onValueChange={handleSourceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a satellite source" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Sources</SelectLabel>
                  {satelliteSources?.map((source: SatelliteSource) => (
                    <SelectItem key={source.id} value={source.id.toString()}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="border rounded-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-gray-100">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-500">Loading imagery...</span>
            </div>
          ) : currentImage ? (
            <div className="relative h-64 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
              <img 
                src={currentImage} 
                alt="Satellite imagery"
                className="object-cover"
                style={{ 
                  transform: `scale(${zoom})`,
                  opacity: opacity / 100,
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
              {/* No actual satellite data note */}
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-70 text-xs p-1 rounded">
                Demo image - Not actual satellite data
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-100 text-gray-400">
              <Satellite className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">Select a source to load imagery</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <div className="space-x-1">
            <Button 
              variant="outline" 
              size="icon"
              onClick={zoomIn}
              disabled={!currentImage || zoom >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={zoomOut}
              disabled={!currentImage || zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => selectedSource && fetchSatelliteImage(selectedSource)}
              disabled={!selectedSource || isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!currentImage}
            onClick={() => currentImage && window.open(currentImage)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
        
        {currentImage && (
          <div className="space-y-2">
            <label className="text-sm font-medium block">Overlay Opacity: {opacity}%</label>
            <Slider 
              value={[opacity]} 
              min={10} 
              max={100} 
              step={10}
              onValueChange={handleOpacityChange} 
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Note: This is a demonstration. In a production environment, this would connect to actual satellite imagery APIs.
      </CardFooter>
    </Card>
  );
};

export default SatelliteImagery;