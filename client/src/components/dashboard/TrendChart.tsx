import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MoreVertical } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ChartDataPoint {
  name: string;
  incidents: number;
  displacement: number;
}

interface TrendChartProps {
  data: ChartDataPoint[];
  title?: string;
}

export default function TrendChart({ data, title = "Risk Indicator Trends" }: TrendChartProps) {
  const [timeRange, setTimeRange] = useState("7");
  
  return (
    <Card className="bg-white rounded-lg shadow border border-neutral-200">
      <CardHeader className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="font-medium text-lg">{title}</CardTitle>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-neutral-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#1565C0"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="displacement" 
                stroke="#FF6D00" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <span className="block w-3 h-3 rounded-full bg-primary mr-2"></span>
            <span className="text-sm text-neutral-600">Incident Reports</span>
          </div>
          <div className="flex items-center">
            <span className="block w-3 h-3 rounded-full bg-secondary mr-2"></span>
            <span className="text-sm text-neutral-600">Displacement Reports</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
