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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar
} from 'recharts';
import { 
  BarChart2, 
  BrainCircuit, 
  GitMerge, 
  Zap,
  Layers,
  RefreshCw
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample data for prediction accuracy
const predictionAccuracyData = [
  { month: 'Jan', accuracy: 78, f1Score: 0.76, precision: 0.80, recall: 0.73 },
  { month: 'Feb', accuracy: 80, f1Score: 0.79, precision: 0.82, recall: 0.76 },
  { month: 'Mar', accuracy: 82, f1Score: 0.81, precision: 0.83, recall: 0.79 },
  { month: 'Apr', accuracy: 85, f1Score: 0.84, precision: 0.86, recall: 0.82 },
  { month: 'May', accuracy: 83, f1Score: 0.82, precision: 0.84, recall: 0.80 },
  { month: 'Jun', accuracy: 86, f1Score: 0.85, precision: 0.87, recall: 0.83 },
  { month: 'Jul', accuracy: 88, f1Score: 0.87, precision: 0.89, recall: 0.85 },
  { month: 'Aug', accuracy: 90, f1Score: 0.89, precision: 0.91, recall: 0.87 },
];

// Sample data for feature importance
const featureImportanceData = [
  { name: 'Historical Conflicts', value: 0.28 },
  { name: 'Political Events', value: 0.22 },
  { name: 'Social Media Sentiment', value: 0.18 },
  { name: 'Economic Indicators', value: 0.12 },
  { name: 'Resource Scarcity', value: 0.08 },
  { name: 'Ethnic Tensions', value: 0.07 },
  { name: 'Governance', value: 0.05 },
];

// Sample data for ensemble models comparison
const ensembleComparisonData = [
  { name: 'Accuracy', rf: 90, gradient: 88, ada: 84, voting: 91 },
  { name: 'Precision', rf: 88, gradient: 86, ada: 82, voting: 89 },
  { name: 'Recall', rf: 86, gradient: 85, ada: 80, voting: 88 },
  { name: 'F1 Score', rf: 87, gradient: 85.5, ada: 81, voting: 88.5 },
  { name: 'AUC', rf: 92, gradient: 90, ada: 86, voting: 93 },
];

// Initial data for predictive modeling
const initialPredictiveModelData = [
  { date: 'Jan', prob: 0.12, threshold: 0.5 },
  { date: 'Feb', prob: 0.18, threshold: 0.5 },
  { date: 'Mar', prob: 0.25, threshold: 0.5 },
  { date: 'Apr', prob: 0.32, threshold: 0.5 },
  { date: 'May', prob: 0.48, threshold: 0.5 },
  { date: 'Jun', prob: 0.62, threshold: 0.5, alert: true },
  { date: 'Jul', prob: 0.58, threshold: 0.5, alert: true },
  { date: 'Aug', prob: 0.45, threshold: 0.5 },
  { date: 'Sep', prob: 0.39, threshold: 0.5 },
  { date: 'Oct', prob: 0.44, threshold: 0.5 },
  { date: 'Nov', prob: 0.55, threshold: 0.5, alert: true },
  { date: 'Dec', prob: 0.72, threshold: 0.5, alert: true },
];

// Sample neural network architecture
const neuralNetworkArchitecture = {
  inputLayer: 15,
  hiddenLayers: [
    { neurons: 64, activation: 'ReLU' },
    { neurons: 32, activation: 'ReLU' },
    { neurons: 16, activation: 'ReLU' },
  ],
  outputLayer: { neurons: 1, activation: 'Sigmoid' },
};

const MachineLearningModels: React.FC = () => {
  const [modelConfig, setModelConfig] = useState({
    confidenceThreshold: 0.5,
    lookbackPeriod: 180,
    useEnsemble: true,
    includeGeoData: true,
  });
  
  // Use state for predictive model data to allow updates
  const [predictiveModelData, setPredictiveModelData] = useState(
    initialPredictiveModelData.map(item => ({
      ...item,
      threshold: modelConfig.confidenceThreshold,
      alert: item.prob > modelConfig.confidenceThreshold
    }))
  );
  
  // Training status simulation
  const [trainingStatus, setTrainingStatus] = useState({
    isTraining: false,
    progress: 100,
    lastTrained: 'August 15, 2025'
  });
  
  // Simulate training
  const startTraining = () => {
    setTrainingStatus({ ...trainingStatus, isTraining: true, progress: 0 });
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 5;
      setTrainingStatus(prev => ({ ...prev, progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
        setTrainingStatus({
          isTraining: false,
          progress: 100,
          lastTrained: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        });
      }
    }, 500);
  };

  return (
    <Card className="mb-8">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardTitle className="text-xl flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5" />
          Machine Learning Models
        </CardTitle>
        <CardDescription className="text-purple-100">
          AI-powered risk assessment using neural networks and ensemble methods
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="predictive" className="w-full">
          <TabsList className="mb-4 grid grid-cols-4">
            <TabsTrigger value="predictive" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" /> Predictive Models
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center">
              <Layers className="h-4 w-4 mr-2" /> Feature Analysis
            </TabsTrigger>
            <TabsTrigger value="neural" className="flex items-center">
              <GitMerge className="h-4 w-4 mr-2" /> Neural Networks
            </TabsTrigger>
            <TabsTrigger value="ensemble" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" /> Ensemble Methods
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictive">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="font-medium mb-4">Conflict Probability Prediction</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={predictiveModelData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 1]} tickFormatter={(value: any) => `${Number(value) * 100}%`} />
                      <Tooltip formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, 'Probability']} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="prob" 
                        name="Conflict Probability" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#probGradient)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="threshold" 
                        name="Alert Threshold" 
                        stroke="#ff7300"
                        strokeWidth={2} 
                        strokeDasharray="5 5" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {predictiveModelData
                    .filter(item => item.alert)
                    .map((item, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="font-medium text-red-800 text-sm">{item.date} Alert</div>
                        <div className="text-red-600 text-sm mt-1">
                          {(item.prob * 100).toFixed(1)}% probability
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-4">Predictive Model Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <Label htmlFor="confidenceThreshold">Alert Threshold: {modelConfig.confidenceThreshold * 100}%</Label>
                    </div>
                    <Input 
                      id="confidenceThreshold"
                      type="range"
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      value={modelConfig.confidenceThreshold}
                      onChange={(e) => {
                        const newThreshold = parseFloat(e.target.value);
                        setModelConfig({...modelConfig, confidenceThreshold: newThreshold});
                        
                        // Update the predictive model data with the new threshold
                        setPredictiveModelData(prev => 
                          prev.map(item => ({
                            ...item,
                            threshold: newThreshold,
                            alert: item.prob > newThreshold
                          }))
                        );
                      }}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lookbackPeriod">Historical Lookback Period (days)</Label>
                    <Select 
                      value={modelConfig.lookbackPeriod.toString()} 
                      onValueChange={(value) => setModelConfig({...modelConfig, lookbackPeriod: parseInt(value)})}
                    >
                      <SelectTrigger id="lookbackPeriod">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="180">Last 180 days</SelectItem>
                        <SelectItem value="365">Last 365 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useEnsemble">Use Ensemble Model</Label>
                    <Switch 
                      id="useEnsemble"
                      checked={modelConfig.useEnsemble}
                      onCheckedChange={(checked) => setModelConfig({...modelConfig, useEnsemble: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeGeoData">Include Geospatial Data</Label>
                    <Switch 
                      id="includeGeoData"
                      checked={modelConfig.includeGeoData}
                      onCheckedChange={(checked) => setModelConfig({...modelConfig, includeGeoData: checked})}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={startTraining}
                      disabled={trainingStatus.isTraining}
                    >
                      {trainingStatus.isTraining ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Training...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Train Model
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {trainingStatus.isTraining && (
                    <div className="mt-2">
                      <Progress value={trainingStatus.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Training in progress: {trainingStatus.progress}%
                      </p>
                    </div>
                  )}
                  
                  {!trainingStatus.isTraining && trainingStatus.lastTrained && (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Last trained: {trainingStatus.lastTrained}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Feature Importance Analysis</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Relative importance of different features in the predictive model based on model coefficients and permutation importance.
                </p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={featureImportanceData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 0.3]} tickFormatter={(value: any) => `${(Number(value) * 100).toFixed(0)}%`} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, 'Importance']} />
                      <Legend />
                      <Bar dataKey="value" name="Feature Importance" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Model Performance Metrics</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Key performance metrics of the model over time showing accuracy, precision, recall, and F1 score.
                </p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={predictionAccuracyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" domain={[70, 100]} />
                      <YAxis yAxisId="right" orientation="right" domain={[0.7, 1]} tickFormatter={(value) => value.toFixed(1)} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="accuracy" 
                        name="Accuracy (%)" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="f1Score" 
                        name="F1 Score" 
                        stroke="#82ca9d" 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="precision" 
                        name="Precision" 
                        stroke="#ffc658" 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="recall" 
                        name="Recall" 
                        stroke="#ff8042" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="neural">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="font-medium mb-4">Neural Network Architecture</h3>
                <div className="relative h-80 bg-gray-50 rounded-lg border p-6">
                  {/* Visual representation of the neural network */}
                  <div className="flex h-full items-center justify-between">
                    {/* Input Layer */}
                    <div className="neural-layer input-layer">
                      <div className="text-center mb-2 font-medium text-sm">Input Layer</div>
                      <div className="flex flex-col gap-1 items-center">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {i + 1}
                          </div>
                        ))}
                        <div className="text-xs text-gray-500 mt-1">+{neuralNetworkArchitecture.inputLayer - 5} more</div>
                      </div>
                    </div>
                    
                    {/* Hidden Layers */}
                    {neuralNetworkArchitecture.hiddenLayers.map((layer, layerIndex) => (
                      <div key={layerIndex} className="neural-layer hidden-layer">
                        <div className="text-center mb-2 font-medium text-sm">Hidden Layer {layerIndex + 1}</div>
                        <div className="flex flex-col gap-1 items-center">
                          {Array(Math.min(5, layer.neurons)).fill(0).map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                              {i + 1}
                            </div>
                          ))}
                          {layer.neurons > 5 && (
                            <div className="text-xs text-gray-500 mt-1">+{layer.neurons - 5} more</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{layer.activation}</div>
                      </div>
                    ))}
                    
                    {/* Output Layer */}
                    <div className="neural-layer output-layer">
                      <div className="text-center mb-2 font-medium text-sm">Output Layer</div>
                      <div className="flex flex-col gap-1 items-center">
                        {Array(neuralNetworkArchitecture.outputLayer.neurons).fill(0).map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{neuralNetworkArchitecture.outputLayer.activation}</div>
                    </div>
                  </div>
                  
                  {/* Connection lines would need SVG - simplified for this example */}
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border rounded-md p-3">
                    <div className="text-xs text-gray-500">Input Features</div>
                    <div className="font-medium">{neuralNetworkArchitecture.inputLayer}</div>
                  </div>
                  <div className="bg-white border rounded-md p-3">
                    <div className="text-xs text-gray-500">Hidden Layers</div>
                    <div className="font-medium">{neuralNetworkArchitecture.hiddenLayers.length}</div>
                  </div>
                  <div className="bg-white border rounded-md p-3">
                    <div className="text-xs text-gray-500">Training Epochs</div>
                    <div className="font-medium">500</div>
                  </div>
                  <div className="bg-white border rounded-md p-3">
                    <div className="text-xs text-gray-500">Batch Size</div>
                    <div className="font-medium">64</div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-4">Neural Network Performance</h3>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Training Accuracy</span>
                      <span className="text-sm">92.5%</span>
                    </div>
                    <Progress value={92.5} className="h-2" />
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Validation Accuracy</span>
                      <span className="text-sm">89.3%</span>
                    </div>
                    <Progress value={89.3} className="h-2" />
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Test Accuracy</span>
                      <span className="text-sm">87.8%</span>
                    </div>
                    <Progress value={87.8} className="h-2" />
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">F1 Score</span>
                      <span className="text-sm">0.86</span>
                    </div>
                    <Progress value={86} className="h-2" />
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Loss</span>
                      <span className="text-sm">0.075</span>
                    </div>
                    <Progress value={92.5} className="h-2" />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    <GitMerge className="h-4 w-4 mr-2" />
                    Adjust Architecture
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ensemble">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Ensemble Models Comparison</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Performance comparison of different ensemble methods including Random Forest, Gradient Boosting, AdaBoost, and Voting Classifier.
                </p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} width={730} height={250} data={ensembleComparisonData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Random Forest" dataKey="rf" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Gradient Boosting" dataKey="gradient" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Radar name="AdaBoost" dataKey="ada" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                      <Radar name="Voting Classifier" dataKey="voting" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border">
                <h3 className="font-medium mb-4">Ensemble Model Insights</h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-sm mb-2 text-indigo-700">
                      Voting Classifier (Best Performance)
                    </h4>
                    <p className="text-sm text-gray-600">
                      Combines predictions from multiple models using majority voting, achieving the highest overall performance with 91% accuracy and 0.89 F1 score.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-sm mb-2 text-purple-700">
                      Random Forest
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ensemble of decision trees with 90% accuracy. Performs well on categorical features and handles non-linear relationships effectively.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-sm mb-2 text-green-700">
                      Gradient Boosting
                    </h4>
                    <p className="text-sm text-gray-600">
                      Sequential ensemble method with 88% accuracy. Optimizes for reducing the errors of previous models in the sequence.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-sm mb-2 text-yellow-700">
                      AdaBoost
                    </h4>
                    <p className="text-sm text-gray-600">
                      Adaptive boosting with 84% accuracy. Focuses on difficult examples that previous models misclassified.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    Train Models
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Last updated: 2 hours ago
        </div>
        <Button>
          Train Models
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MachineLearningModels;