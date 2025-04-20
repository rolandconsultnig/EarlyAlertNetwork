import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the interface for a language
interface Language {
  code: string;
  name: string;
}

// PropTypes for component
interface TranslationSelectorProps {
  onLanguageChange: (languageCode: string) => void;
  disabled?: boolean;
}

export function TranslationSelector({
  onLanguageChange,
  disabled = false,
}: TranslationSelectorProps) {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  // Fetch available languages
  const {
    data: languages,
    isLoading: isLoadingLanguages,
    error: languagesError,
  } = useQuery({
    queryKey: ["/api/translation/languages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/translation/languages");
      const data = await response.json();
      return data as Language[];
    },
  });

  // Check if translation service is available
  const {
    data: translationStatus,
    isLoading: isCheckingStatus,
  } = useQuery({
    queryKey: ["/api/translation/status"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/translation/status");
      const data = await response.json();
      return data as { available: boolean; message: string };
    },
  });

  // Handle language selection
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    onLanguageChange(value);
  };

  // Show error if translation service is not available
  useEffect(() => {
    if (translationStatus && !translationStatus.available) {
      toast({
        title: "Translation Service Unavailable",
        description: translationStatus.message,
        variant: "destructive",
      });
    }
  }, [translationStatus, toast]);

  // Show error if languages failed to load
  useEffect(() => {
    if (languagesError) {
      toast({
        title: "Failed to load languages",
        description: "Could not load available languages for translation.",
        variant: "destructive",
      });
    }
  }, [languagesError, toast]);

  const isTranslationAvailable = translationStatus?.available;
  const isLoading = isLoadingLanguages || isCheckingStatus;

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium">Language:</span>
      <Select
        value={selectedLanguage}
        onValueChange={handleLanguageChange}
        disabled={disabled || isLoading || !isTranslationAvailable}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select language">
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </span>
            ) : (
              languages?.find((lang: Language) => lang.code === selectedLanguage)?.name ||
              "English"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages?.map((language: Language) => (
            <SelectItem key={language.code} value={language.code}>
              <span className="flex items-center justify-between w-full">
                {language.name}
                {language.code === selectedLanguage && (
                  <Check className="w-4 h-4 ml-2" />
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}