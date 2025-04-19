import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Label,
  BarChart,
  Bar
} from 'recharts';
import { 
  ArrowUpRight, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Map, 
  Calendar, 
  RefreshCw,
  Download,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Interfaces for data structure
interface IncidentHistoryPoint {
  date: string;
  count: number;
  severity: number;
  region: string;
  category: string;
}

interface PredictionPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
  anomaly: boolean;
  confidence: number;
}

interface RegionData {
  region: string;
  currentMonth: number;
  predictedNextMonth: number;
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
  anomalyRisk: 'high' | 'medium' | 'low';
}

interface IncidentTrendPredictionProps {
  apiEndpoint?: string;
  title?: string;
  description?: string;
  onPredictionGenerated?: (prediction: PredictionPoint[]) => void;
  historyData?: IncidentHistoryPoint[];
  predictionData?: PredictionPoint[];
  isLoading?: boolean;
}

// Placeholder data
const sampleHistoryData: IncidentHistoryPoint[] = [
  // Last 12 months of historical data (sample)
  { date: '2024-04', count: 24, severity: 3.2, region: 'North Central', category: 'Conflict' },
  { date: '2024-03', count: 29, severity: 3.4, region: 'North Central', category: 'Conflict' },
  { date: '2024-02', count: 18, severity: 3.1, region: 'North Central', category: 'Conflict' },
  { date: '2024-01', count: 22, severity: 3.3, region: 'North Central', category: 'Conflict' },
  { date: '2023-12', count: 32, severity: 3.5, region: 'North Central', category: 'Conflict' },
  { date: '2023-11', count: 27, severity: 3.2, region: 'North Central', category: 'Conflict' },
  { date: '2023-10', count: 25, severity: 3.0, region: 'North Central', category: 'Conflict' },
  { date: '2023-09', count: 20, severity: 2.8, region: 'North Central', category: 'Conflict' },
  { date: '2023-08', count: 15, severity: 2.5, region: 'North Central', category: 'Conflict' },
  { date: '2023-07', count: 18, severity: 2.6, region: 'North Central', category: 'Conflict' },
  { date: '2023-06', count: 22, severity: 2.9, region: 'North Central', category: 'Conflict' },
  { date: '2023-05', count: 26, severity: 3.0, region: 'North Central', category: 'Conflict' },
];

const samplePredictionData: PredictionPoint[] = [
  // Next 6 months of predictions (sample)
  { date: '2024-05', predicted: 28, lower: 22, upper: 34, anomaly: false, confidence: 0.85 },
  { date: '2024-06', predicted: 32, lower: 25, upper: 39, anomaly: false, confidence: 0.80 },
  { date: '2024-07', predicted: 35, lower: 27, upper: 43, anomaly: false, confidence: 0.75 },
  { date: '2024-08', predicted: 45, lower: 33, upper: 57, anomaly: true, confidence: 0.65 },
  { date: '2024-09', predicted: 38, lower: 26, upper: 50, anomaly: false, confidence: 0.60 },
  { date: '2024-10', predicted: 30, lower: 20, upper: 40, anomaly: false, confidence: 0.55 },
];

// Regional trend data (sample)
const sampleRegionalData: RegionData[] = [
  { region: 'North Central', currentMonth: 24, predictedNextMonth: 28, trend: 'up', percentChange: 16.7, anomalyRisk: 'medium' },
  { region: 'North East', currentMonth: 18, predictedNextMonth: 25, trend: 'up', percentChange: 38.9, anomalyRisk: 'high' },
  { region: 'North West', currentMonth: 15, predictedNextMonth: 16, trend: 'up', percentChange: 6.7, anomalyRisk: 'low' },
  { region: 'South East', currentMonth: 12, predictedNextMonth: 10, trend: 'down', percentChange: -16.7, anomalyRisk: 'low' },
  { region: 'South South', currentMonth: 8, predictedNextMonth: 7, trend: 'down', percentChange: -12.5, anomalyRisk: 'low' },
  { region: 'South West', currentMonth: 10, predictedNextMonth: 12, trend: 'up', percentChange: 20.0, anomalyRisk: 'medium' },
];

// Main component
const IncidentTrendPrediction: React.FC<IncidentTrendPredictionProps> = ({
  apiEndpoint = '/api/analytics/incident-prediction',
  title = 'Incident Trend Prediction',
  description = 'AI-powered prediction of conflict incidents based on historical patterns',
  onPredictionGenerated,
  historyData = sampleHistoryData,
  predictionData = samplePredictionData,
  isLoading = false,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('6months');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('trend');
  const { toast } = useToast();

  // Combine historical and prediction data for visualization
  const combinedData = useMemo(() => {
    return [
      ...historyData.map(point => ({
        date: point.date,
        actual: point.count,
        predicted: null,
        lower: null,
        upper: null
      })),
      ...predictionData.map(point => ({
        date: point.date,
        actual: null,
        predicted: point.predicted,
        lower: point.lower,
        upper: point.upper
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [historyData, predictionData]);

  // Calculate anomaly months (prediction points with anomaly flag)
  const anomalyMonths = useMemo(() => {
    return predictionData
      .filter(point => point.anomaly)
      .map(point => point.date);
  }, [predictionData]);

  // Get largest increases in next 3 months (hotspots)
  const hotspots = useMemo(() => {
    return sampleRegionalData
      .filter(region => region.percentChange > 15)
      .sort((a, b) => b.percentChange - a.percentChange);
  }, []);

  // Simulated API call to refresh predictions
  const refreshPredictions = async () => {
    setIsRefreshing(true);
    try {
      // In a real implementation, fetch new predictions from the API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Predictions Updated",
        description: "Incident trend predictions have been refreshed with latest data",
        variant: "default",
      });
      
      // Notify parent component
      if (onPredictionGenerated) {
        onPredictionGenerated(predictionData);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not refresh prediction data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format date labels for better readability
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(date);
  };

  // Calculate summary statistics
  const currentMonthIncidents = historyData[historyData.length - 1]?.count || 0;
  const nextMonthPredicted = predictionData[0]?.predicted || 0;
  const percentChange = ((nextMonthPredicted - currentMonthIncidents) / currentMonthIncidents) * 100;
  const predictionConfidence = predictionData[0]?.confidence * 100 || 0;
  
  // Handle export to CSV
  const exportToCSV = () => {
    const csvContent = [
      // Header
      ["Date", "Actual", "Predicted", "Lower Bound", "Upper Bound", "Confidence"].join(","),
      // Data rows
      ...combinedData.map(row => 
        [
          row.date, 
          row.actual || "", 
          row.predicted || "", 
          row.lower || "", 
          row.upper || "",
          predictionData.find(p => p.date === row.date)?.confidence || ""
        ].join(",")
      )
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `incident_predictions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Prediction data has been exported to CSV file",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPredictions}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Updating..." : "Refresh"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-3 rounded-lg border">
            <div className="text-sm text-muted-foreground">Current Month</div>
            <div className="text-2xl font-bold mt-1">{currentMonthIncidents}</div>
            <div className="text-xs text-muted-foreground mt-1">incidents recorded</div>
          </div>
          
          <div className="bg-background p-3 rounded-lg border">
            <div className="text-sm text-muted-foreground">Next Month Forecast</div>
            <div className="text-2xl font-bold mt-1 flex items-center">
              {nextMonthPredicted}
              <span className={cn(
                "text-sm ml-2 flex items-center",
                percentChange > 0 ? "text-red-500" : "text-green-500"
              )}>
                {percentChange > 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 mr-1 rotate-180" />
                )}
                {Math.abs(percentChange).toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">predicted with {predictionConfidence.toFixed(0)}% confidence</div>
          </div>
          
          <div className="bg-background p-3 rounded-lg border">
            <div className="text-sm text-muted-foreground">Anomaly Detection</div>
            <div className="text-2xl font-bold mt-1 flex items-center">
              {anomalyMonths.length}
              {anomalyMonths.length > 0 && (
                <AlertTriangle className="h-4 w-4 ml-2 text-amber-500" />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {anomalyMonths.length > 0
                ? `potential anomalies detected in coming months`
                : `no anomalies detected in forecast period`}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Select 
                value={selectedRegion} 
                onValueChange={setSelectedRegion}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="northcentral">North Central</SelectItem>
                  <SelectItem value="northeast">North East</SelectItem>
                  <SelectItem value="northwest">North West</SelectItem>
                  <SelectItem value="southeast">South East</SelectItem>
                  <SelectItem value="southsouth">South South</SelectItem>
                  <SelectItem value="southwest">South West</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Incident Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Incidents</SelectItem>
                  <SelectItem value="conflict">Conflict</SelectItem>
                  <SelectItem value="terrorism">Terrorism</SelectItem>
                  <SelectItem value="disaster">Natural Disaster</SelectItem>
                  <SelectItem value="health">Health Crisis</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={selectedTimeframe}
                onValueChange={setSelectedTimeframe}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="12months">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="shrink-0">
              <div className="flex items-center space-x-1">
                <div className="flex h-2 w-3 rounded-full bg-primary"></div>
                <span className="text-xs text-muted-foreground">Historical</span>
                <div className="ml-3 flex h-2 w-3 rounded-full bg-blue-400"></div>
                <span className="text-xs text-muted-foreground">Predicted</span>
                <div className="ml-3 flex h-2 w-3 rounded-full bg-slate-200"></div>
                <span className="text-xs text-muted-foreground">Confidence Interval</span>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trend">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trend Analysis
              </TabsTrigger>
              <TabsTrigger value="regions">
                <Map className="h-4 w-4 mr-2" />
                Regional Breakdown
              </TabsTrigger>
              <TabsTrigger value="comparison">
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparison
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="trend" className="pt-4">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Incident Count',
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [value, 'Incidents']}
                      labelFormatter={formatDate}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      strokeWidth={2}
                      name="Historical"
                      connectNulls
                    />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#3b82f6" 
                      fill="#93c5fd" 
                      strokeWidth={2}
                      name="Predicted"
                      connectNulls
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lower" 
                      stroke="transparent" 
                      fill="#f1f5f9" 
                      stackId="1"
                      name="Lower Bound"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="upper" 
                      stroke="transparent" 
                      fill="#f1f5f9" 
                      stackId="1"
                      name="Upper Bound"
                    />
                    <Legend />
                    
                    {/* Add vertical lines for anomalies */}
                    {anomalyMonths.map((month, index) => (
                      <ReferenceLine
                        key={index} 
                        x={month} 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      >
                        <Label 
                          value="Anomaly" 
                          position="top" 
                          fill="#f59e0b"
                        />
                      </ReferenceLine>
                    ))}
                    
                    {/* Add a vertical line to separate history and prediction */}
                    <ReferenceLine
                      x={historyData[historyData.length - 1]?.date}
                      stroke="#cbd5e1"
                      strokeWidth={1}
                      label={{ value: 'Current', position: 'top' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {anomalyMonths.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center text-amber-700 mb-1">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <h4 className="font-medium">Potential Anomalies Detected</h4>
                  </div>
                  <p className="text-sm text-amber-700">
                    Unusual activity predicted for {anomalyMonths.map(formatDate).join(', ')}.
                    This may indicate emerging patterns that differ significantly from historical trends.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="regions" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sampleRegionalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="region"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Incident Count',
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' }
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="currentMonth" 
                        fill="#8884d8" 
                        name="Current Month" 
                      />
                      <Bar 
                        dataKey="predictedNextMonth" 
                        fill="#82ca9d" 
                        name="Predicted Next Month" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Regional Hotspots</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Regions with largest predicted increases in incident frequency
                  </p>
                  
                  <div className="space-y-4">
                    {hotspots.length > 0 ? (
                      hotspots.map((region, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs mr-2">
                              {index + 1}
                            </span>
                            <div>
                              <div className="font-medium">{region.region}</div>
                              <div className="text-xs text-muted-foreground">
                                Current: {region.currentMonth} → Predicted: {region.predictedNextMonth}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={cn(
                              "text-sm font-medium",
                              region.percentChange > 30 ? "text-red-500" : "text-amber-500"
                            )}>
                              +{region.percentChange.toFixed(1)}%
                            </span>
                            <Badge className={cn(
                              "ml-2",
                              region.anomalyRisk === 'high' ? "bg-red-100 text-red-800" :
                              region.anomalyRisk === 'medium' ? "bg-amber-100 text-amber-800" :
                              "bg-green-100 text-green-800"
                            )}>
                              {region.anomalyRisk}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No significant hotspots detected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-base font-medium mb-1">Prediction Methodology</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    This prediction model uses multiple statistical approaches:
                  </p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Time series analysis with ARIMA modeling</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Seasonal decomposition for cyclical patterns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Machine learning for correlation with external factors</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Anomaly detection using isolation forests</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-1">Prediction Accuracy</h4>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${predictionConfidence}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Historical MAPE: 8.3%</span>
                      <span>Current confidence: {predictionConfidence.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-base font-medium mb-1">Year-over-Year Comparison</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    How current trends compare with the previous year:
                  </p>
                  
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month"
                          type="category"
                          allowDuplicatedCategory={false}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          name="2023" 
                          data={[
                            { month: 'Jan', value: 15 },
                            { month: 'Feb', value: 18 },
                            { month: 'Mar', value: 22 },
                            { month: 'Apr', value: 19 },
                            { month: 'May', value: 26 },
                            { month: 'Jun', value: 22 },
                            { month: 'Jul', value: 18 },
                            { month: 'Aug', value: 15 },
                            { month: 'Sep', value: 20 },
                            { month: 'Oct', value: 25 },
                            { month: 'Nov', value: 27 },
                            { month: 'Dec', value: 32 },
                          ]}
                          dataKey="value"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          name="2024" 
                          data={[
                            { month: 'Jan', value: 22 },
                            { month: 'Feb', value: 18 },
                            { month: 'Mar', value: 29 },
                            { month: 'Apr', value: 24 },
                            { month: 'May', value: 28 },
                            { month: 'Jun', value: 32 },
                            { month: 'Jul', value: 35 },
                            { month: 'Aug', value: 45 },
                            { month: 'Sep', value: 38 },
                            { month: 'Oct', value: 30 },
                          ]}
                          dataKey="value"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year-to-Date Change</span>
                      <span className="font-medium text-red-500">+22.5%</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted-foreground">Projected Annual Change</span>
                      <span className="font-medium text-red-500">+18.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground flex items-center">
          <Info className="h-3 w-3 mr-1" />
          Last updated: {new Date().toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground">
          Powered by IPCR Early Warning & Response System
        </div>
      </CardFooter>
    </Card>
  );
};

export default IncidentTrendPrediction;