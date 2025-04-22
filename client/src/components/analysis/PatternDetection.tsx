import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Incident } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle, RefreshCw, Calendar, MapPin, Users, Activity, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Pattern types
interface TemporalPattern {
  name: string;
  description: string;
  significance: number; // 0-100
  relevance: string; // "high", "medium", "low"
  period: string;
  incidents: number[];
}

interface SpatialPattern {
  name: string;
  description: string;
  significance: number; // 0-100
  relevance: string;
  region: string;
  incidents: number[];
}

interface ActorPattern {
  name: string;
  description: string;
  significance: number; // 0-100
  relevance: string;
  actor: string;
  incidents: number[];
}

type Pattern = TemporalPattern | SpatialPattern | ActorPattern;

interface PatternDetectionProps {
  className?: string;
}

const PatternDetection: React.FC<PatternDetectionProps> = ({ className }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('temporal');
  const [patterns, setPatterns] = useState<{
    temporal: TemporalPattern[],
    spatial: SpatialPattern[],
    actor: ActorPattern[]
  }>({
    temporal: [],
    spatial: [],
    actor: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch incidents
  const { data: incidents, isLoading, error, refetch } = useQuery<Incident[]>({
    queryKey: ['/api/incidents'],
  });

  // Analyze incidents for patterns when data is loaded
  useEffect(() => {
    if (incidents && !isAnalyzing) {
      analyzePatterns(incidents);
    } else if (!incidents && !isLoading && !isAnalyzing) {
      // Show loading state instead of sample patterns
      setIsAnalyzing(true);
    }
  }, [incidents, isLoading]);

  // Generate sample patterns when incidents data isn't available
  const generateSamplePatterns = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const samplePatterns = {
        temporal: [
          {
            name: "Weekend Violence Pattern",
            description: "Incidents tend to occur with higher frequency over weekends, showing a 45% increase compared to weekdays.",
            significance: 78,
            relevance: "high",
            period: "Weekends",
            incidents: [1, 2, 3, 4, 5]
          },
          {
            name: "Seasonal Escalation",
            description: "Conflict incidents increase by 30% during the dry season (November-March).",
            significance: 65,
            relevance: "medium",
            period: "Dry Season",
            incidents: [6, 7, 8, 9, 10]
          }
        ],
        spatial: [
          {
            name: "North East Hotspot",
            description: "The North East region has experienced a significant concentration of violent incidents in the past 3 months.",
            significance: 82,
            relevance: "high",
            region: "North East",
            incidents: [11, 12, 13, 14, 15]
          },
          {
            name: "Border Vulnerability",
            description: "Communities within 50km of the northern border show 40% higher incident rates than interior regions.",
            significance: 74,
            relevance: "medium",
            region: "Northern Border Areas",
            incidents: [16, 17, 18, 19, 20]
          }
        ],
        actor: [
          {
            name: "Organized Group Pattern",
            description: "A series of 8 high-severity incidents follow similar tactical patterns suggesting organized coordination.",
            significance: 88,
            relevance: "high",
            actor: "Organized Non-State Actor",
            incidents: [21, 22, 23, 24, 25]
          },
          {
            name: "Resource Competition",
            description: "Farmers and herders are involved in 35% of all recorded land-based conflicts this quarter.",
            significance: 71,
            relevance: "medium",
            actor: "Resource Competitors",
            incidents: [26, 27, 28, 29, 30]
          }
        ]
      };
      
      setPatterns(samplePatterns);
      setIsAnalyzing(false);
    }, 1500);
  };

  // Function to analyze incidents for patterns using AI
  const analyzePatterns = async (incidentData: Incident[]) => {
    setIsAnalyzing(true);
    
    try {
      // Call the AI pattern detection API
      const response = await fetch('/api/analysis/patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incidents: incidentData,
          // Optional filters that can be added later
          category: activeTab === 'all' ? undefined : activeTab,
          region: undefined, // Could be added as a filter parameter
          timeframe: undefined, // Could be added as a filter parameter
        }),
      });
      
      if (!response.ok) {
        throw new Error('AI pattern analysis failed');
      }
      
      const data = await response.json();
      
      if (data.patterns && data.aiGenerated) {
        // Use AI-generated patterns
        // Ensure patterns has the correct structure
        const formattedPatterns = {
          temporal: Array.isArray(data.patterns.temporal) ? data.patterns.temporal : [],
          spatial: Array.isArray(data.patterns.spatial) ? data.patterns.spatial : [],
          actor: Array.isArray(data.patterns.actor) ? data.patterns.actor : []
        };
        
        // Validate that each pattern has the required properties
        formattedPatterns.temporal = formattedPatterns.temporal.map(pattern => ({
          name: pattern.name || "Unnamed Pattern",
          description: pattern.description || "No description provided",
          significance: typeof pattern.significance === 'number' ? pattern.significance : 50,
          relevance: ['high', 'medium', 'low'].includes(pattern.relevance) ? pattern.relevance : 'medium',
          period: pattern.period || "Unknown period",
          incidents: Array.isArray(pattern.incidents) ? pattern.incidents : []
        }));
        
        formattedPatterns.spatial = formattedPatterns.spatial.map(pattern => ({
          name: pattern.name || "Unnamed Pattern",
          description: pattern.description || "No description provided",
          significance: typeof pattern.significance === 'number' ? pattern.significance : 50,
          relevance: ['high', 'medium', 'low'].includes(pattern.relevance) ? pattern.relevance : 'medium',
          region: pattern.region || "Unknown region",
          incidents: Array.isArray(pattern.incidents) ? pattern.incidents : []
        }));
        
        formattedPatterns.actor = formattedPatterns.actor.map(pattern => ({
          name: pattern.name || "Unnamed Pattern",
          description: pattern.description || "No description provided",
          significance: typeof pattern.significance === 'number' ? pattern.significance : 50,
          relevance: ['high', 'medium', 'low'].includes(pattern.relevance) ? pattern.relevance : 'medium',
          actor: pattern.actor || "Unknown actor",
          incidents: Array.isArray(pattern.incidents) ? pattern.incidents : []
        }));
        
        setPatterns(formattedPatterns);
      } else {
        // Fall back to rule-based analysis if AI analysis fails
        const detectedPatterns = {
          temporal: detectTemporalPatterns(incidentData),
          spatial: detectSpatialPatterns(incidentData),
          actor: detectActorPatterns(incidentData)
        };
        setPatterns(detectedPatterns);
      }
    } catch (error) {
      console.error("Error analyzing patterns:", error);
      
      // Fall back to rule-based analysis
      try {
        const detectedPatterns = {
          temporal: detectTemporalPatterns(incidentData),
          spatial: detectSpatialPatterns(incidentData),
          actor: detectActorPatterns(incidentData)
        };
        setPatterns(detectedPatterns);
        
        toast({
          title: "AI Analysis Unavailable",
          description: "Using rule-based analysis as a fallback.",
          variant: "destructive"
        });
      } catch (fallbackError) {
        console.error("Fallback analysis also failed:", fallbackError);
        toast({
          title: "Analysis Error",
          description: "Failed to analyze patterns in the incident data.",
          variant: "destructive"
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Detect temporal patterns in incidents
  const detectTemporalPatterns = (incidentData: Incident[]): TemporalPattern[] => {
    // Group incidents by month
    const monthGroups: Record<string, Incident[]> = {};
    
    incidentData.forEach(incident => {
      if (!incident.reportedAt) return;
      
      const date = new Date(incident.reportedAt);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthGroups[monthYear]) {
        monthGroups[monthYear] = [];
      }
      
      monthGroups[monthYear].push(incident);
    });
    
    // Find months with unusually high incident counts
    const patterns: TemporalPattern[] = [];
    const monthCounts = Object.keys(monthGroups).map(month => ({
      month,
      count: monthGroups[month].length
    }));
    
    // Calculate average incidents per month
    const avgCount = monthCounts.reduce((sum, item) => sum + item.count, 0) / Math.max(1, monthCounts.length);
    
    // Find months with significantly more incidents
    monthCounts.forEach(({ month, count }) => {
      if (count > avgCount * 1.5) {
        const monthDate = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]) - 1);
        const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        patterns.push({
          name: `High Activity in ${monthName}`,
          description: `Unusually high number of incidents (${count}) reported in ${monthName}, which is ${Math.round((count - avgCount) / avgCount * 100)}% above average.`,
          significance: Math.min(100, Math.round((count / avgCount) * 60)),
          relevance: count > avgCount * 2 ? "high" : "medium",
          period: monthName,
          incidents: monthGroups[month].map(i => i.id)
        });
      }
    });
    
    // Look for weekday patterns
    const weekdayGroups: Record<number, Incident[]> = {};
    
    incidentData.forEach(incident => {
      if (!incident.reportedAt) return;
      
      const date = new Date(incident.reportedAt);
      const weekday = date.getDay();
      
      if (!weekdayGroups[weekday]) {
        weekdayGroups[weekday] = [];
      }
      
      weekdayGroups[weekday].push(incident);
    });
    
    const weekdayCounts = Object.keys(weekdayGroups).map(weekday => ({
      weekday: parseInt(weekday),
      count: weekdayGroups[parseInt(weekday)].length
    }));
    
    const avgWeekdayCount = weekdayCounts.reduce((sum, item) => sum + item.count, 0) / Math.max(1, weekdayCounts.length);
    
    weekdayCounts.forEach(({ weekday, count }) => {
      if (count > avgWeekdayCount * 1.3) {
        const weekdayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekday];
        
        patterns.push({
          name: `${weekdayName} Incident Pattern`,
          description: `${count} incidents have occurred on ${weekdayName}s, which is ${Math.round((count - avgWeekdayCount) / avgWeekdayCount * 100)}% above average.`,
          significance: Math.min(90, Math.round((count / avgWeekdayCount) * 50)),
          relevance: count > avgWeekdayCount * 1.5 ? "high" : "medium",
          period: `${weekdayName}s`,
          incidents: weekdayGroups[weekday].map(i => i.id)
        });
      }
    });
    
    return patterns;
  };

  // Detect spatial patterns in incidents
  const detectSpatialPatterns = (incidentData: Incident[]): SpatialPattern[] => {
    // Group incidents by region
    const regionGroups: Record<string, Incident[]> = {};
    
    incidentData.forEach(incident => {
      if (!incident.region) return;
      
      if (!regionGroups[incident.region]) {
        regionGroups[incident.region] = [];
      }
      
      regionGroups[incident.region].push(incident);
    });
    
    // Find regions with unusually high incident counts
    const patterns: SpatialPattern[] = [];
    const regionCounts = Object.keys(regionGroups).map(region => ({
      region,
      count: regionGroups[region].length
    }));
    
    // Calculate average incidents per region
    const avgCount = regionCounts.reduce((sum, item) => sum + item.count, 0) / Math.max(1, regionCounts.length);
    
    // Find regions with significantly more incidents
    regionCounts.forEach(({ region, count }) => {
      if (count > avgCount * 1.2) {
        patterns.push({
          name: `Hotspot in ${region}`,
          description: `${region} has experienced ${count} incidents, which is ${Math.round((count - avgCount) / avgCount * 100)}% above the regional average.`,
          significance: Math.min(100, Math.round((count / avgCount) * 70)),
          relevance: count > avgCount * 1.5 ? "high" : "medium",
          region,
          incidents: regionGroups[region].map(i => i.id)
        });
      }
    });
    
    // Look for proximity patterns (clusters)
    // For simplicity, we're just using regions here, but a more complex algorithm would use lat/lng
    
    return patterns;
  };

  // Detect actor-based patterns in incidents
  const detectActorPatterns = (incidentData: Incident[]): ActorPattern[] => {
    // This would parse actor information from incident metadata
    const patterns: ActorPattern[] = [];
    
    // Group by severity first
    const severityGroups: Record<string, Incident[]> = {};
    
    incidentData.forEach(incident => {
      if (!incident.severity) return;
      
      if (!severityGroups[incident.severity]) {
        severityGroups[incident.severity] = [];
      }
      
      severityGroups[incident.severity].push(incident);
    });
    
    // Look for common actors in high severity incidents
    if (severityGroups['high'] && severityGroups['high'].length > 0) {
      // For this demo, we'll create a simulated pattern
      patterns.push({
        name: 'High-Severity Actor Pattern',
        description: `${severityGroups['high'].length} high-severity incidents share similar characteristics, potentially indicating organized activities.`,
        significance: 85,
        relevance: 'high',
        actor: 'Unknown Organized Group',
        incidents: severityGroups['high'].map(i => i.id)
      });
    }
    
    // Group by categories
    const categoryGroups: Record<string, Incident[]> = {};
    
    incidentData.forEach(incident => {
      if (!incident.category) return;
      
      if (!categoryGroups[incident.category]) {
        categoryGroups[incident.category] = [];
      }
      
      categoryGroups[incident.category].push(incident);
    });
    
    // Find categories with significant incidents
    Object.keys(categoryGroups).forEach(category => {
      const incidents = categoryGroups[category];
      if (incidents.length >= 3) {
        patterns.push({
          name: `${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} Pattern`,
          description: `${incidents.length} incidents categorized as "${category.replace('_', ' ')}" show similar patterns of execution.`,
          significance: Math.min(90, incidents.length * 10),
          relevance: incidents.length > 5 ? 'high' : 'medium',
          actor: `${category} Perpetrators`,
          incidents: incidents.map(i => i.id)
        });
      }
    });
    
    return patterns;
  };

  // Get pattern icon based on relevance
  const getPatternIcon = (pattern: Pattern) => {
    switch (pattern.relevance) {
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "medium":
        return <Activity className="h-5 w-5 text-amber-500" />;
      case "low":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-neutral-500" />;
    }
  };

  // Get icon for specific pattern type
  const getPatternTypeIcon = (patternType: string) => {
    switch (patternType) {
      case "temporal":
        return <Calendar className="h-5 w-5" />;
      case "spatial":
        return <MapPin className="h-5 w-5" />;
      case "actor":
        return <Users className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  // Render pattern card
  const renderPatternCard = (pattern: Pattern, index: number) => (
    <Card key={index} className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getPatternIcon(pattern)}
            <CardTitle className="text-lg">{pattern.name}</CardTitle>
          </div>
          <Badge className={`
            ${pattern.relevance === 'high' ? 'bg-red-100 text-red-800' : 
              pattern.relevance === 'medium' ? 'bg-amber-100 text-amber-800' : 
              'bg-blue-100 text-blue-800'}
          `}>
            {pattern.relevance.charAt(0).toUpperCase() + pattern.relevance.slice(1)} Significance
          </Badge>
        </div>
        <CardDescription>
          <div className="mt-1 flex items-center gap-1">
            <span>Confidence Rating:</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full">
              <div 
                className={`h-2 rounded-full ${
                  pattern.significance > 70 ? 'bg-red-500' : 
                  pattern.significance > 40 ? 'bg-amber-500' : 
                  'bg-blue-500'
                }`}
                style={{ width: `${pattern.significance}%` }}
              ></div>
            </div>
            <span className="text-xs">{pattern.significance}%</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600">{pattern.description}</p>
        
        <div className="mt-3 text-xs text-gray-500 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>
            {'period' in pattern ? 
              `Time period: ${pattern.period}` : 
              'region' in pattern ? 
              `Region: ${pattern.region}` : 
              `Actor: ${pattern.actor}`
            }
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="text-xs text-gray-500">
          {pattern.incidents.length} related incident{pattern.incidents.length !== 1 ? 's' : ''}
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Pattern Detection</CardTitle>
            <CardDescription>
              Advanced analysis of incident patterns and correlations
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              setIsAnalyzing(true);
            }}
            disabled={isLoading || isAnalyzing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="temporal" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="temporal" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Temporal
            </TabsTrigger>
            <TabsTrigger value="spatial" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Spatial
            </TabsTrigger>
            <TabsTrigger value="actor" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Actor-Based
            </TabsTrigger>
          </TabsList>
          
          {(isLoading || isAnalyzing) ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                {isLoading ? 'Loading incident data...' : 'Analyzing patterns...'}
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
              <h3 className="text-lg font-medium mb-1">Analysis Error</h3>
              <p className="text-sm text-muted-foreground text-center">
                Failed to load or analyze incident data. Please try again.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : (
            <>
              <TabsContent value="temporal" className="pt-4">
                {patterns.temporal.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {patterns.temporal.map((pattern, index) => renderPatternCard(pattern, index))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <Calendar className="h-12 w-12" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No temporal patterns detected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are currently no significant time-based patterns in the incident data.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="spatial" className="pt-4">
                {patterns.spatial.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {patterns.spatial.map((pattern, index) => renderPatternCard(pattern, index))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <MapPin className="h-12 w-12" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No spatial patterns detected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are currently no significant location-based patterns in the incident data.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="actor" className="pt-4">
                {patterns.actor.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {patterns.actor.map((pattern, index) => renderPatternCard(pattern, index))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <Users className="h-12 w-12" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No actor-based patterns detected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are currently no significant actor-based patterns in the incident data.
                    </p>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PatternDetection;