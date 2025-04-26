import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronDown } from 'lucide-react';
import { speak, cancelSpeech } from '@/lib/speech-utils';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ScreenReaderProps {
  pageTitle: string;
}

const ScreenReader: React.FC<ScreenReaderProps> = ({ pageTitle }) => {
  const [isReading, setIsReading] = useState(false);
  const { toast } = useToast();

  // Reads the entire page content, focusing on main content areas
  const readPage = useCallback(() => {
    // Cancel any ongoing speech
    cancelSpeech();
    
    // First, read the page title
    const pageTitleText = `Current page: ${pageTitle}`;
    
    // Get main content elements
    const mainContent = document.querySelector('main');
    if (!mainContent) {
      speak(`${pageTitleText}. Sorry, I couldn't find the main content of this page.`);
      return;
    }
    
    // Extract headings
    const headings = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let headingsText = '';
    
    if (headings.length > 0) {
      headingsText = 'This page contains the following sections: ';
      headings.forEach((heading, index) => {
        headingsText += `${heading.textContent}${index < headings.length - 1 ? ', ' : '.'}`;
      });
    }
    
    // Get paragraphs and other text content
    const paragraphs = mainContent.querySelectorAll('p, .card-content, .description');
    let paragraphsText = '';
    
    paragraphs.forEach(paragraph => {
      if (paragraph.textContent && paragraph.textContent.trim().length > 0) {
        paragraphsText += `${paragraph.textContent.trim()}. `;
      }
    });
    
    // Combine all text
    const fullText = `${pageTitleText}. ${headingsText} ${paragraphsText}`;
    
    // Speak the text
    speak(fullText, { rate: 1.0 });
    setIsReading(true);
    
    // Update state when speech ends
    const handleSpeechEnd = () => {
      setIsReading(false);
      window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
    };
    
    window.speechSynthesis.addEventListener('end', handleSpeechEnd);
    
  }, [pageTitle]);

  // Reads just the headings to give an overview
  const readHeadings = useCallback(() => {
    cancelSpeech();
    
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      speak(`Current page: ${pageTitle}. This page doesn't have any headings.`);
      return;
    }
    
    let headingsText = `Current page: ${pageTitle}. This page contains the following sections: `;
    headings.forEach((heading, index) => {
      const level = heading.tagName.charAt(1);
      headingsText += `Level ${level} heading: ${heading.textContent}${index < headings.length - 1 ? '. ' : '.'}`;
    });
    
    speak(headingsText, { rate: 1.0 });
    setIsReading(true);
    
    const handleSpeechEnd = () => {
      setIsReading(false);
      window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
    };
    
    window.speechSynthesis.addEventListener('end', handleSpeechEnd);
    
  }, [pageTitle]);

  // Reads the data in any visible tables
  const readTables = useCallback(() => {
    cancelSpeech();
    
    const tables = document.querySelectorAll('table');
    if (tables.length === 0) {
      speak(`Current page: ${pageTitle}. This page doesn't have any data tables.`);
      return;
    }
    
    let tablesText = `Found ${tables.length} data tables on this page. `;
    
    tables.forEach((table, tableIndex) => {
      tablesText += `Table ${tableIndex + 1}: `;
      
      // Read the table headers
      const headers = table.querySelectorAll('th');
      if (headers.length > 0) {
        tablesText += 'Headers: ';
        headers.forEach((header, index) => {
          tablesText += `${header.textContent}${index < headers.length - 1 ? ', ' : '. '}`;
        });
      }
      
      // Read table data (limit to first 5 rows to avoid information overload)
      const rows = table.querySelectorAll('tr');
      let rowCount = 0;
      
      rows.forEach(row => {
        // Skip header row
        if (row.querySelectorAll('th').length === 0 && rowCount < 5) {
          rowCount++;
          tablesText += `Row ${rowCount}: `;
          
          const cells = row.querySelectorAll('td');
          cells.forEach((cell, index) => {
            tablesText += `${cell.textContent}${index < cells.length - 1 ? ', ' : '. '}`;
          });
        }
      });
      
      if (rows.length > 5) {
        tablesText += `And ${rows.length - 5} more rows. `;
      }
    });
    
    speak(tablesText, { rate: 0.9 });
    setIsReading(true);
    
    const handleSpeechEnd = () => {
      setIsReading(false);
      window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
    };
    
    window.speechSynthesis.addEventListener('end', handleSpeechEnd);
    
  }, [pageTitle]);

  // Read charts and visualizations
  const readCharts = useCallback(() => {
    cancelSpeech();
    
    // Look for elements that might be charts (this would need to be adapted based on the charting library used)
    const charts = document.querySelectorAll('.recharts-wrapper, .chart-container, [role="img"][aria-label*="chart"]');
    
    if (charts.length === 0) {
      speak(`Current page: ${pageTitle}. This page doesn't have any charts or visualizations.`);
      return;
    }
    
    let chartsText = `Found ${charts.length} charts or visualizations on this page. `;
    
    charts.forEach((chart, index) => {
      const chartLabel = chart.getAttribute('aria-label') || `Chart ${index + 1}`;
      chartsText += `${chartLabel}. `;
      
      // Try to get the chart description
      const description = chart.querySelector('.chart-description, [aria-describedby]')?.textContent;
      if (description) {
        chartsText += `Description: ${description}. `;
      }
    });
    
    speak(chartsText, { rate: 0.9 });
    setIsReading(true);
    
    const handleSpeechEnd = () => {
      setIsReading(false);
      window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
    };
    
    window.speechSynthesis.addEventListener('end', handleSpeechEnd);
    
  }, [pageTitle]);

  // Stop ongoing reading
  const stopReading = useCallback(() => {
    cancelSpeech();
    setIsReading(false);
    
    toast({
      title: "Reading Stopped",
      description: "Screen reading has been stopped.",
    });
  }, [toast]);

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={isReading ? stopReading : readPage}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {isReading ? "Stop Reading" : "Read Page"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isReading ? "Stop the current reading" : "Read the page content aloud"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              More reading options
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={readHeadings}>
            Read Headings Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={readTables}>
            Read Data Tables
          </DropdownMenuItem>
          <DropdownMenuItem onClick={readCharts}>
            Describe Charts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ScreenReader;