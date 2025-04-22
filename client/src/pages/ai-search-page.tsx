import MainLayout from "@/components/layout/MainLayout";
import { AISearchEngine } from "@/components/search/AISearchEngine";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AISearchPage() {
  // Check if the OpenAI API service is available
  const { data: translationStatus } = useQuery({
    queryKey: ["/api/translation/status"],
    refetchOnWindowFocus: false
  });
  
  const isAIAvailable = translationStatus?.available;

  return (
    <MainLayout title="AI Search & Analysis">
      <div className="space-y-6">
        {!isAIAvailable && (
          <Alert className="mb-4 border-amber-500 bg-amber-50 text-amber-800">
            <Info className="h-4 w-4" />
            <AlertTitle>AI Services Limited</AlertTitle>
            <AlertDescription>
              The AI search functionality requires an OpenAI API key. Basic search capabilities are still available.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Search & Analysis</CardTitle>
            <CardDescription>
              Search through incidents, discover patterns, and gain AI-powered insights about conflict events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              This search engine uses advanced AI to help you find relevant information across all incidents in the system. 
              You can search by keyword, location, time period, or ask natural language questions.
            </p>
            
            <h3 className="text-sm font-semibold mb-2">Example search queries:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
              <li>"Show all high severity incidents in the North East region"</li>
              <li>"Find patterns in ethnic conflicts from the past month"</li>
              <li>"Which areas had the most violent incidents this year?"</li>
              <li>"Is there a correlation between resource scarcity and violent conflicts?"</li>
            </ul>
          </CardContent>
        </Card>
        
        <AISearchEngine />
      </div>
    </MainLayout>
  );
}