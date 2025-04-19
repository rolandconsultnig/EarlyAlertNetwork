import React, { useEffect, useState } from 'react';
import { Incident } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, AlertCircle, MapPin, Clock, User, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmojiReactionSystem from './EmojiReactionSystem';

interface IncidentDetailModalProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!incident) {
    return null;
  }

  // Extract coordinates from incident for map display
  const getCoordinates = () => {
    try {
      if (incident.coordinates && typeof incident.coordinates === 'string') {
        const coords = JSON.parse(incident.coordinates);
        if (coords.lat !== undefined && coords.lng !== undefined) {
          return [coords.lat, coords.lng];
        }
      }
    } catch (e) {
      console.error('Error parsing coordinates:', e);
    }
    
    // Fallback to center of Nigeria
    return [9.0765, 7.3986];
  };
  
  const coordinates = getCoordinates();
  const formattedDate = new Date(incident.reportedAt).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'medium':
        return 'bg-amber-100 border-amber-500 text-amber-800';
      case 'low':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'pending':
        return 'bg-amber-100 border-amber-500 text-amber-800';
      case 'resolved':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{incident.title}</DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className={`flex items-center text-xs px-2 py-1 rounded-full border ${getSeverityColor(incident.severity)}`}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span className="font-medium">Severity: {incident.severity}</span>
              </div>
              
              <div className={`flex items-center text-xs px-2 py-1 rounded-full border ${getStatusColor(incident.status)}`}>
                <Info className="h-3 w-3 mr-1" />
                <span className="font-medium">Status: {incident.status}</span>
              </div>
              
              <div className="flex items-center text-xs px-2 py-1 rounded-full border bg-purple-100 border-purple-500 text-purple-800">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="font-medium">{incident.region}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="responses">Response Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm mb-4">{incident.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{incident.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="font-medium">Reported:</span>
                    <span className="ml-2">{formattedDate}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium">Reported By:</span>
                    <span className="ml-2">User ID: {incident.reportedBy}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                    <span className="font-medium">Verification:</span>
                    <span className="ml-2 capitalize">{incident.verificationStatus || 'Pending'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                    <span className="font-medium">Category:</span>
                    <span className="ml-2 capitalize">{incident.category?.replace('_', ' ') || 'Uncategorized'}</span>
                  </div>
                  
                  {incident.impactedPopulation && (
                    <div className="flex items-center text-sm">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
                      <span className="font-medium">Population Affected:</span>
                      <span className="ml-2">{incident.impactedPopulation.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {/* Additional metadata can be added here */}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3">Reactions</h3>
                <EmojiReactionSystem 
                  incidentId={incident.id} 
                  userId={user?.id}
                  displayLabel={true}
                  displayCount={true}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="updates" className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-semibold mb-3">Incident Updates</h3>
              <p className="text-sm text-gray-500">No updates available for this incident.</p>
              
              {/* Update history would go here */}
            </div>
          </TabsContent>
          
          <TabsContent value="responses" className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-semibold mb-3">Response Plans</h3>
              <p className="text-sm text-gray-500">No response plans have been created for this incident.</p>
              
              {/* Response plans would go here */}
              
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  Create Response Plan
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          
          <div className="flex gap-2">
            <Button variant="secondary">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Alert
            </Button>
            {incident.status !== 'resolved' && (
              <Button>
                Mark as Resolved
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetailModal;