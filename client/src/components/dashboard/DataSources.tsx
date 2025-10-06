import { useQuery } from "@tanstack/react-query";
import { DataSource } from "@shared/schema.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RssIcon, Globe, MessageSquare, Satellite, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataSources() {
  const { data: sources, isLoading, error } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'field_reports':
        return <RssIcon className="mr-2 h-4 w-4" />;
      case 'news_aggregation':
        return <Globe className="mr-2 h-4 w-4" />;
      case 'social_media_monitor':
        return <MessageSquare className="mr-2 h-4 w-4" />;
      case 'satellite_imagery':
        return <Satellite className="mr-2 h-4 w-4" />;
      case 'sms_reports':
        return <Phone className="mr-2 h-4 w-4" />;
      default:
        return <RssIcon className="mr-2 h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'degraded':
        return 'bg-warning/10 text-warning';
      case 'offline':
        return 'bg-error/10 text-error';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow border border-neutral-200">
      <CardHeader className="p-4 border-b border-neutral-200">
        <CardTitle className="font-medium text-lg">Data Source Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-error">
            Failed to load data sources. Please try again.
          </div>
        ) : (
          <div className="space-y-4">
            {sources?.map((source) => (
              <div key={source.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  {getSourceIcon(source.type)}
                  <span className="text-sm font-medium">{source.name}</span>
                </div>
                <Badge className={getStatusColor(source.status)}>
                  {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}
        
        <Button variant="outline" className="w-full mt-4 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700 font-medium hover:bg-neutral-50">
          Configure Data Sources
        </Button>
      </CardContent>
    </Card>
  );
}
