import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Table, 
  BarChart, 
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { speak, cancelSpeech, getAvailableVoices } from '@/lib/speech-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ScreenReaderProps {
  pageTitle: string;
}

const ScreenReader: React.FC<ScreenReaderProps> = ({ pageTitle }) => {
  const [isReading, setIsReading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [readingMode, setReadingMode] = useState('full-page');
  const [voiceRate, setVoiceRate] = useState<number>(1.0);
  const { toast } = useToast();

  const readPage = async () => {
    setIsLoading(true);
    
    try {
      const voices = await getAvailableVoices();
      const voice = voices.find(v => v.lang.includes('en')) || null;
      
      // Process the page content based on the selected mode
      let textToRead = "";
      
      switch (readingMode) {
        case 'headings':
          textToRead = extractHeadings();
          break;
        case 'tables':
          textToRead = extractTablesContent();
          break;
        case 'charts':
          textToRead = describeCharts();
          break;
        case 'full-page':
        default:
          textToRead = extractPageContent();
          break;
      }
      
      if (!textToRead) {
        textToRead = `No ${readingMode === 'full-page' ? 'content' : readingMode} found on this page.`;
      }
      
      // Start with the page title for context
      const contextText = `Current page: ${pageTitle}. ${textToRead}`;
      
      setIsReading(true);
      speak(contextText, { 
        voice, 
        rate: voiceRate,
        onEnd: () => setIsReading(false) 
      });
      
      toast({
        title: "Screen Reader Active",
        description: `Reading ${readingMode === 'full-page' ? 'page content' : readingMode}`,
      });
    } catch (error) {
      console.error('Screen reader error:', error);
      toast({
        title: "Screen Reader Error",
        description: "An error occurred while trying to read the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const stopReading = () => {
    cancelSpeech();
    setIsReading(false);
    
    toast({
      title: "Screen Reader Stopped",
      description: "Speech has been stopped.",
    });
  };
  
  // Extract page content for reading
  const extractPageContent = (): string => {
    // This is a basic implementation that gets the main content
    const mainElement = document.querySelector('main');
    if (!mainElement) return '';
    
    // Get all text content but ignore hidden elements and scripts
    return Array.from(mainElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th'))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map(el => el.textContent)
      .filter(text => text && text.trim().length > 0)
      .join('. ');
  };
  
  // Extract headings for quick navigation
  const extractHeadings = (): string => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) return '';
    
    let result = 'Page headings: ';
    headings.forEach((heading, index) => {
      const level = heading.tagName.charAt(1);
      const text = heading.textContent?.trim();
      if (text) {
        result += `Heading level ${level}: ${text}. `;
      }
    });
    
    return result;
  };
  
  // Extract and describe table content
  const extractTablesContent = (): string => {
    const tables = document.querySelectorAll('table');
    if (tables.length === 0) return '';
    
    let result = `Found ${tables.length} table${tables.length !== 1 ? 's' : ''} on the page. `;
    
    tables.forEach((table, tableIndex) => {
      result += `Table ${tableIndex + 1}: `;
      
      // Look for caption or summary
      const caption = table.querySelector('caption');
      if (caption && caption.textContent) {
        result += `Caption: ${caption.textContent.trim()}. `;
      }
      
      // Count rows and columns
      const rows = table.querySelectorAll('tr');
      const headerCells = table.querySelectorAll('th');
      
      result += `Contains ${rows.length} rows and approximate ${headerCells.length > 0 ? headerCells.length : 'unknown number of'} columns. `;
      
      // Read headers if present
      if (headerCells.length > 0) {
        result += 'Headers: ';
        headerCells.forEach((th, index) => {
          if (th.textContent) {
            result += `${th.textContent.trim()}${index < headerCells.length - 1 ? ', ' : '. '}`;
          }
        });
      }
    });
    
    return result;
  };
  
  // Describe charts and visualizations
  const describeCharts = (): string => {
    const charts = document.querySelectorAll('[data-visualization], .recharts-wrapper, canvas, svg:not(.lucide)');
    if (charts.length === 0) return '';
    
    let result = `Found ${charts.length} visualization${charts.length !== 1 ? 's' : ''} on the page. `;
    
    charts.forEach((chart, index) => {
      result += `Visualization ${index + 1}: `;
      
      // Try to get the chart title from nearby elements
      const parent = chart.parentElement;
      const title = parent?.querySelector('h1, h2, h3, h4, h5, h6');
      if (title && title.textContent) {
        result += `titled "${title.textContent.trim()}". `;
      } else {
        result += 'untitled. ';
      }
      
      // Check if the chart has a description or aria-label
      const description = chart.getAttribute('aria-label') || chart.getAttribute('title');
      if (description) {
        result += `Description: ${description}. `;
      } else {
        result += 'No detailed description available. ';
      }
    });
    
    return result;
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <Select
          value={readingMode}
          onValueChange={setReadingMode}
          disabled={isReading}
        >
          <SelectTrigger className="w-[180px] h-8 text-sm">
            <SelectValue placeholder="Select what to read" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-page">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Full Page</span>
              </div>
            </SelectItem>
            <SelectItem value="headings">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Headings Only</span>
              </div>
            </SelectItem>
            <SelectItem value="tables">
              <div className="flex items-center">
                <Table className="h-4 w-4 mr-2" />
                <span>Tables</span>
              </div>
            </SelectItem>
            <SelectItem value="charts">
              <div className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                <span>Charts & Visualizations</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {isReading ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 h-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
            onClick={stopReading}
          >
            <VolumeX className="h-4 w-4 mr-2" />
            Stop Reading
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 h-8"
            onClick={readPage}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Read Aloud
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="flex items-center">
        <span className="text-xs text-gray-500 mr-2 w-16">Speed:</span>
        <Slider
          value={[voiceRate]}
          min={0.5}
          max={2}
          step={0.1}
          className="w-32"
          onValueChange={(value) => setVoiceRate(value[0])}
          disabled={isReading}
        />
        <span className="text-xs text-gray-500 ml-2">{voiceRate}x</span>
      </div>
    </div>
  );
};

export default ScreenReader;