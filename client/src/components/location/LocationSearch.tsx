import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, X } from 'lucide-react';

// Define Nigeria's major cities and their coordinates
// This will be our initial dataset for autocomplete suggestions
const nigeriaCities = [
  { name: 'Lagos', state: 'Lagos', coords: { lat: 6.5244, lng: 3.3792 } },
  { name: 'Kano', state: 'Kano', coords: { lat: 12.0022, lng: 8.5920 } },
  { name: 'Ibadan', state: 'Oyo', coords: { lat: 7.3775, lng: 3.9470 } },
  { name: 'Abuja', state: 'FCT', coords: { lat: 9.0765, lng: 7.3986 } },
  { name: 'Port Harcourt', state: 'Rivers', coords: { lat: 4.8156, lng: 7.0498 } },
  { name: 'Benin City', state: 'Edo', coords: { lat: 6.3350, lng: 5.6037 } },
  { name: 'Maiduguri', state: 'Borno', coords: { lat: 11.8311, lng: 13.1510 } },
  { name: 'Zaria', state: 'Kaduna', coords: { lat: 11.1111, lng: 7.7208 } },
  { name: 'Aba', state: 'Abia', coords: { lat: 5.1167, lng: 7.3667 } },
  { name: 'Jos', state: 'Plateau', coords: { lat: 9.8965, lng: 8.8583 } },
  { name: 'Ilorin', state: 'Kwara', coords: { lat: 8.5353, lng: 4.5448 } },
  { name: 'Enugu', state: 'Enugu', coords: { lat: 6.4431, lng: 7.5198 } },
  { name: 'Abeokuta', state: 'Ogun', coords: { lat: 7.1475, lng: 3.3619 } },
  { name: 'Onitsha', state: 'Anambra', coords: { lat: 6.1667, lng: 6.7833 } },
  { name: 'Warri', state: 'Delta', coords: { lat: 5.5167, lng: 5.7500 } },
  { name: 'Sokoto', state: 'Sokoto', coords: { lat: 13.0622, lng: 5.2339 } },
  { name: 'Okene', state: 'Kogi', coords: { lat: 7.5500, lng: 6.2333 } },
  { name: 'Calabar', state: 'Cross River', coords: { lat: 4.9608, lng: 8.3308 } },
  { name: 'Oshogbo', state: 'Osun', coords: { lat: 7.7667, lng: 4.5667 } },
  { name: 'Katsina', state: 'Katsina', coords: { lat: 12.9889, lng: 7.6017 } },
  { name: 'Akure', state: 'Ondo', coords: { lat: 7.2500, lng: 5.2000 } },
  { name: 'Kaduna', state: 'Kaduna', coords: { lat: 10.5167, lng: 7.4333 } },
  { name: 'Makurdi', state: 'Benue', coords: { lat: 7.7322, lng: 8.5391 } },
  { name: 'Minna', state: 'Niger', coords: { lat: 9.6139, lng: 6.5569 } },
  { name: 'Yola', state: 'Adamawa', coords: { lat: 9.2333, lng: 12.5000 } },
  { name: 'Uyo', state: 'Akwa Ibom', coords: { lat: 5.0500, lng: 7.9333 } },
  { name: 'Owerri', state: 'Imo', coords: { lat: 5.4833, lng: 7.0333 } },
  { name: 'Damaturu', state: 'Yobe', coords: { lat: 11.7454, lng: 11.9669 } },
  { name: 'Gombe', state: 'Gombe', coords: { lat: 10.2903, lng: 11.1672 } },
  { name: 'Asaba', state: 'Delta', coords: { lat: 6.2028, lng: 6.7000 } },
  { name: 'Lokoja', state: 'Kogi', coords: { lat: 7.8023, lng: 6.7333 } },
  { name: 'Dutse', state: 'Jigawa', coords: { lat: 11.8000, lng: 9.3333 } },
  { name: 'Jalingo', state: 'Taraba', coords: { lat: 8.9000, lng: 11.3667 } },
  { name: 'Ikeja', state: 'Lagos', coords: { lat: 6.6018, lng: 3.3515 } },
  { name: 'Bauchi', state: 'Bauchi', coords: { lat: 10.3103, lng: 9.8422 } },
  { name: 'Umuahia', state: 'Abia', coords: { lat: 5.5252, lng: 7.4904 } },
  { name: 'Kebbi', state: 'Kebbi', coords: { lat: 12.4533, lng: 4.1975 } },
  { name: 'Awka', state: 'Anambra', coords: { lat: 6.2000, lng: 7.0667 } },
  { name: 'Yenagoa', state: 'Bayelsa', coords: { lat: 4.9267, lng: 6.3330 } },
  { name: 'Lafia', state: 'Nasarawa', coords: { lat: 8.5000, lng: 8.5167 } },
  { name: 'Birnin Kebbi', state: 'Kebbi', coords: { lat: 12.4539, lng: 4.1975 } },
  { name: 'Abakaliki', state: 'Ebonyi', coords: { lat: 6.3333, lng: 8.1000 } }
];

// Interface for search results
export interface LocationSearchResult {
  name: string;
  state?: string;
  region?: string;
  coords: {
    lat: number;
    lng: number;
  };
}

interface LocationSearchProps {
  onSelectLocation: (location: LocationSearchResult) => void;
  initialQuery?: string;
  placeholder?: string;
}

export function LocationSearch({
  onSelectLocation,
  initialQuery = '',
  placeholder = 'Search for a city or location...'
}: LocationSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Function to search for locations based on the query
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    setShowResults(true);
    
    // Simulate an API call with a timeout
    const timeoutId = setTimeout(() => {
      // Filter cities that match the query
      const matchedCities = nigeriaCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(matchedCities);
      setIsSearching(false);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle selecting a location
  const handleSelectLocation = (location: LocationSearchResult) => {
    onSelectLocation(location);
    setQuery(`${location.name}, ${location.state}`);
    setShowResults(false);
  };
  
  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pr-10"
            onFocus={() => query && setShowResults(true)}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-10 rounded-l-none"
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {showResults && (results.length > 0 || isSearching) && (
        <Card
          ref={resultsRef}
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto p-0 shadow-lg"
        >
          {isSearching ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : (
            <div className="py-1">
              {results.map((result, index) => (
                <button
                  key={`${result.name}-${index}`}
                  className="flex w-full items-start px-4 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                  onClick={() => handleSelectLocation(result)}
                >
                  <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-xs text-muted-foreground">{result.state}, Nigeria</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}