import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Nigeria's regions and states
const nigeriaRegions = {
  'North Central': [
    'Benue', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau', 'FCT'
  ],
  'North East': [
    'Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'
  ],
  'North West': [
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'
  ],
  'South East': [
    'Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'
  ],
  'South South': [
    'Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers'
  ],
  'South West': [
    'Ekiti', 'Lagos', 'Ogun', 'Ondo', 'Osun', 'Oyo'
  ]
};

// Get all states in a flat array
const allStates = Object.values(nigeriaRegions).flat();

interface RegionSelectorProps {
  onSelectRegion: (region: string) => void;
  onSelectState?: (state: string) => void;
  defaultRegion?: string;
  defaultState?: string;
  showStates?: boolean;
}

export function RegionSelector({
  onSelectRegion,
  onSelectState,
  defaultRegion = '',
  defaultState = '',
  showStates = true
}: RegionSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState(defaultRegion);
  const [selectedState, setSelectedState] = useState(defaultState);
  
  // Handle region selection
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    onSelectRegion(value);
    
    // Reset state when region changes
    if (selectedState && !nigeriaRegions[value as keyof typeof nigeriaRegions]?.includes(selectedState)) {
      setSelectedState('');
      onSelectState?.('');
    }
  };
  
  // Handle state selection
  const handleStateChange = (value: string) => {
    setSelectedState(value);
    onSelectState?.(value);
    
    // Update region based on state
    for (const [region, states] of Object.entries(nigeriaRegions)) {
      if (states.includes(value) && region !== selectedRegion) {
        setSelectedRegion(region);
        onSelectRegion(region);
        break;
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Select value={selectedRegion} onValueChange={handleRegionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Regions</SelectLabel>
              {Object.keys(nigeriaRegions).map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {showStates && (
        <div>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>All States</SelectLabel>
                {allStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectGroup>
              
              {selectedRegion && (
                <SelectGroup>
                  <SelectLabel>{selectedRegion} States</SelectLabel>
                  {nigeriaRegions[selectedRegion as keyof typeof nigeriaRegions]?.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}