import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  BarChart2, 
  TrendingUp, 
  Activity, 
  Settings,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample data for time series model
const timeSeriesData = [
  { date: 'Jan', actual: 20, predicted: 22, confidence: [18, 26] },
  { date: 'Feb', actual: 28, predicted: 26, confidence: [22, 30] },
  { date: 'Mar', actual: 25, predicted: 28, confidence: [23, 33] },
  { date: 'Apr', actual: 35, predicted: 32, confidence: [27, 37] },
  { date: 'May', actual: 30, predicted: 33, confidence: [28, 38] },
  { date: 'Jun', actual: 38, predicted: 36, confidence: [31, 41] },
  { date: 'Jul', actual: 40, predicted: 42, confidence: [37, 47] },
  { date: 'Aug', actual: 45, predicted: 43, confidence: [38, 48] },
  { date: 'Sep', actual: null, predicted: 48, confidence: [43, 53] },
  { date: 'Oct', actual: null, predicted: 52, confidence: [47, 57] },
  { date: 'Nov', actual: null, predicted: 48, confidence: [42, 54] },
  { date: 'Dec', actual: null, predicted: 45, confidence: [40, 50] },
];

// Sample data for Bayesian network analysis
const bayesianData = [
  { factor: 'Political Tension', likelihood: 0.75, impact: 8 },
  { factor: 'Resource Scarcity', likelihood: 0.64, impact: 7 },
  { factor: 'Historical Conflict', likelihood: 0.82, impact: 9 },
  { factor: 'Ethnic Division', likelihood: 0.68, impact: 8 },
  { factor: 'Unemployment', likelihood: 0.58, impact: 6 },
  { factor: 'Climate Factors', likelihood: 0.45, impact: 5 },
  { factor: 'Governance Issues', likelihood: 0.72, impact: 7 },
];

// Sample data for regression analysis
const regressionData = [
  { x: 5, y: 12, region: 'North' },
  { x: 10, y: 18, region: 'North' },
  { x: 15, y: 24, region: 'North' },
  { x: 20, y: 28, region: 'North' },
  { x: 7, y: 10, region: 'South' },
  { x: 12, y: 14, region: 'South' },
  { x: 18, y: 20, region: 'South' },
  { x: 23, y: 25, region: 'South' },
  { x: 8, y: 14, region: 'East' },
  { x: 13, y: 20, region: 'East' },
  { x: 17, y: 25, region: 'East' },
  { x: 25, y: 32, region: 'East' },
  { x: 6, y: 8, region: 'West' },
  { x: 11, y: 13, region: 'West' },
  { x: 16, y: 19, region: 'West' },
  { x: 22, y: 26, region: 'West' },
];

const COLORS = ['#1565C0', '#FF6D00', '#2E7D32', '#D32F2F', '#0288D1'];

const StatisticalModels: React.FC = () => {
  const [modelConfig, setModelConfig] = useState({
    timeInterval: 'monthly',
    confidenceLevel: 0.95,
    forecastHorizon: 4,
    smoothingFactor: 0.5,
  });

  return (
    <Card className="mb-8">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <CardTitle className="text-xl flex items-center">
          <BarChart2 className="mr-2 h-5 w-5" />
          Statistical Models
        </CardTitle>
        <CardDescription className="text-indigo-100">
          Bayesian and time series analysis for risk pattern identification
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="timeseries" className="w-full">
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="timeseries" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" /> Time Series
            </TabsTrigger>
            <TabsTrigger value="bayesian" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" /> Bayesian Analysis
            </TabsTrigger>
            <TabsTrigger value="regression" className="flex items-center">
              <PieChartIcon className="h-4 w-4 mr-2" /> Regression Models
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeseries">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#2563EB"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                        name="Actual Incidents"
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Predicted Incidents"
                      />
                      {/* Confidence interval */}
                      <Line
                        type="monotone"
                        dataKey="confidence[0]"
                        stroke="#E5E7EB"
                        strokeWidth={0}
                        dot={false}
                        activeDot={false}
                        name="Lower Bound"
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence[1]"
                        stroke="#E5E7EB"
                        strokeWidth={0}
                        dot={false}
                        activeDot={false}
                        name="Upper Bound"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-4 text-sm text-gray-500">
                  Time Series Forecast with 95% Confidence Interval
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-4">Model Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timeInterval">Time Interval</Label>
                    <Select 
                      value={modelConfig.timeInterval} 
                      onValueChange={(value) => setModelConfig({...modelConfig, timeInterval: value})}
                    >
                      <SelectTrigger id="timeInterval">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="confidenceLevel">Confidence Level: {modelConfig.confidenceLevel}</Label>
                    <Slider 
                      id="confidenceLevel"
                      min={0.8}
                      max={0.99}
                      step={0.01}
                      value={[modelConfig.confidenceLevel]}
                      onValueChange={(value) => setModelConfig({...modelConfig, confidenceLevel: value[0]})}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="forecastHorizon">Forecast Horizon (periods)</Label>
                    <Input 
                      id="forecastHorizon"
                      type="number" 
                      min={1}
                      max={12}
                      value={modelConfig.forecastHorizon}
                      onChange={(e) => setModelConfig({...modelConfig, forecastHorizon: parseInt(e.target.value)})}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smoothingFactor">Smoothing Factor: {modelConfig.smoothingFactor}</Label>
                    <Slider 
                      id="smoothingFactor"
                      min={0.1}
                      max={0.9}
                      step={0.1}
                      value={[modelConfig.smoothingFactor]}
                      onValueChange={(value) => setModelConfig({...modelConfig, smoothingFactor: value[0]})}
                      className="mt-2"
                    />
                  </div>
                  
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Update Forecast
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bayesian">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Bayesian Network Analysis</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Probabilistic analysis of conflict risk factors using Bayesian networks to identify causal relationships and conditional probabilities between variables.
                </p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bayesianData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 1]} />
                      <YAxis type="category" dataKey="factor" />
                      <Tooltip formatter={(value) => [value, 'Likelihood']} />
                      <Legend />
                      <Bar dataKey="likelihood" name="Likelihood" fill="#1565C0">
                        {bayesianData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Factor Impact Analysis</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Estimated impact of different risk factors on conflict probability based on historical data analysis and expert assessments.
                </p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bayesianData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="factor" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impact" name="Impact Score (0-10)" fill="#FF6D00" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="regression">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Multivariate Regression Analysis</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Regression models analyzing the relationships between socioeconomic factors and conflict incidents across different regions.
                </p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid />
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        name="Socioeconomic Index" 
                        unit="" 
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        name="Incident Frequency" 
                        unit="" 
                      />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Legend />
                      <Scatter 
                        name="Northern Region" 
                        data={regressionData.filter(d => d.region === 'North')} 
                        fill="#1565C0" 
                      />
                      <Scatter 
                        name="Southern Region" 
                        data={regressionData.filter(d => d.region === 'South')} 
                        fill="#FF6D00" 
                      />
                      <Scatter 
                        name="Eastern Region" 
                        data={regressionData.filter(d => d.region === 'East')} 
                        fill="#2E7D32" 
                      />
                      <Scatter 
                        name="Western Region" 
                        data={regressionData.filter(d => d.region === 'West')} 
                        fill="#D32F2F" 
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium mb-4">Regression Analysis Insights</h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-sm mb-2">Northern Region</h4>
                    <p className="text-sm text-gray-600">Strong positive correlation (r = 0.92) between socioeconomic factors and conflict incidents. Regression coefficient: 1.38.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-sm mb-2">Southern Region</h4>
                    <p className="text-sm text-gray-600">Moderate correlation (r = 0.68) with lower incident rate. Regression coefficient: 0.76.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-sm mb-2">Eastern Region</h4>
                    <p className="text-sm text-gray-600">Strong correlation (r = 0.88) with high confidence (p < 0.01). Regression coefficient: 1.25.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-sm mb-2">Western Region</h4>
                    <p className="text-sm text-gray-600">Moderate correlation (r = 0.71) with statistical significance (p < 0.05). Regression coefficient: 0.85.</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    Generate Detailed Report
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t">
        <Button variant="outline" size="sm">
          Configure Models
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StatisticalModels;