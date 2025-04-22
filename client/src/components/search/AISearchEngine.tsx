import React, { useState, useEffect } from 'react';
import { Search, Loader2, Filter, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Incident } from '@shared/schema';

interface AISearchEngineProps {
  className?: string;
}

interface SearchResult {
  id: number;
  title: string;
  description: string;
  relevance: number;
  category: string;
  severity: string;
  region: string;
  date: string;
  aiInsight?: string;
}

export function AISearchEngine({ className }: AISearchEngineProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const { toast } = useToast();

  // Fetch incidents on component mount
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch('/api/incidents');
        if (!response.ok) {
          throw new Error('Failed to fetch incidents');
        }
        const data = await response.json();
        setIncidents(data);
      } catch (error) {
        console.error('Error fetching incidents:', error);
      }
    };
    
    fetchIncidents();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setResults([]);

    try {
      // Call the AI search endpoint
      const response = await fetch('/api/search/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, filter: activeFilter }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        // If no AI results, fall back to basic search
        performBasicSearch();
      } else {
        setResults(data.results);
      }
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        title: "AI Search Unavailable",
        description: "Using basic search as a fallback.",
        variant: "destructive",
      });
      
      // Fallback to basic search when AI fails
      performBasicSearch();
    } finally {
      setIsSearching(false);
    }
  };

  const performBasicSearch = () => {
    // Basic search logic as fallback when AI search fails
    const searchResults: SearchResult[] = incidents
      .filter(incident => {
        // Perform simple text matching
        const matchesQuery = (
          (incident.title && incident.title.toLowerCase().includes(query.toLowerCase())) ||
          (incident.description && incident.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        // Apply category filter if not "all"
        const matchesFilter = activeFilter === 'all' || 
          (incident.category && incident.category === activeFilter);
        
        return matchesQuery && matchesFilter;
      })
      .map(incident => ({
        id: incident.id,
        title: incident.title || 'Untitled Incident',
        description: incident.description || 'No description available',
        relevance: 70, // Default relevance for basic search
        category: incident.category || 'uncategorized',
        severity: incident.severity || 'medium',
        region: incident.region || 'Unknown',
        date: incident.reportedAt ? new Date(incident.reportedAt).toLocaleDateString() : 'Unknown date',
      }));
    
    setResults(searchResults);
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>AI-Powered Search Engine</CardTitle>
              <CardDescription>
                Search incidents and get AI-enhanced insights
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search incidents, patterns, or ask questions..."
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>
          
          <Tabs defaultValue="all" onValueChange={setActiveFilter}>
            <div className="flex items-center justify-between mb-2">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="conflict">Conflict</TabsTrigger>
                <TabsTrigger value="disaster">Disaster</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="political">Political</TabsTrigger>
              </TabsList>
              <div className="flex items-center text-sm text-muted-foreground">
                <Filter className="mr-1 h-4 w-4" />
                <span>Filter results</span>
              </div>
            </div>
            
            {/* Categories content tabs */}
            <TabsContent value="all" className="space-y-4">
              {renderSearchResults()}
            </TabsContent>
            <TabsContent value="conflict" className="space-y-4">
              {renderSearchResults('conflict')}
            </TabsContent>
            <TabsContent value="disaster" className="space-y-4">
              {renderSearchResults('disaster')}
            </TabsContent>
            <TabsContent value="health" className="space-y-4">
              {renderSearchResults('health')}
            </TabsContent>
            <TabsContent value="political" className="space-y-4">
              {renderSearchResults('political')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  function renderSearchResults(filter?: string) {
    if (isSearching) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Searching with AI...</p>
        </div>
      );
    }

    if (!results.length && query.trim()) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query or filters
          </p>
        </div>
      );
    }

    if (!query.trim()) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Search className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Enter a search query to find incidents or ask questions
          </p>
        </div>
      );
    }

    // Filter results based on the selected category tab
    const filteredResults = filter ? 
      results.filter(result => result.category === filter) : 
      results;

    return (
      <>
        <p className="text-sm text-muted-foreground mb-2">
          {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
        </p>
        
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <Card key={result.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(result.severity)}>
                      {result.severity}
                    </Badge>
                    <Badge variant="outline">
                      {result.category}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2 text-xs">
                    <span>{result.region}</span>
                    <span>•</span>
                    <span>{result.date}</span>
                    <span>•</span>
                    <span>ID: {result.id}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{result.description}</p>
                
                {result.aiInsight && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                    <p className="text-xs font-medium text-blue-800 mb-1">
                      AI Insight
                    </p>
                    <p className="text-sm text-blue-700">
                      {result.aiInsight}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/10 py-2">
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs text-muted-foreground">
                    Relevance: {result.relevance}%
                  </span>
                  <Button variant="link" size="sm">
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </>
    );
  }
}

export default AISearchEngine;