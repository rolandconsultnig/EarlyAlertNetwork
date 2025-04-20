import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Languages, 
  Loader2, 
  Check, 
  ChevronDown,
  Globe 
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TranslationInfo, TranslatedIncident } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OneClickTranslateButtonProps {
  incidentId: number;
  defaultLanguage?: string;
  disabled?: boolean;
  onTranslationComplete: (translatedData: TranslatedIncident) => void;
  compact?: boolean;
}

export function OneClickTranslateButton({
  incidentId,
  defaultLanguage = "en",
  disabled = false,
  onTranslationComplete,
  compact = false
}: OneClickTranslateButtonProps) {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
  const [previousTranslations, setPreviousTranslations] = useState<string[]>([]);
  
  // Fetch available languages
  const {
    data: languages,
    isLoading: isLoadingLanguages,
  } = useQuery({
    queryKey: ["/api/translation/languages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/translation/languages");
      const data = await response.json();
      return data;
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

  // Translation mutation
  const translateMutation = useMutation({
    mutationFn: async (targetLanguage: string) => {
      if (!targetLanguage) {
        throw new Error("Target language is required");
      }

      const response = await apiRequest(
        "POST",
        `/api/incidents/${incidentId}/translate`,
        { targetLanguage }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Translation failed");
      }
      
      return await response.json();
    },
    onSuccess: (data: TranslatedIncident) => {
      if (data.translationInfo?.targetLanguage) {
        // Add this language to previous translations if not already there
        if (!previousTranslations.includes(data.translationInfo.targetLanguage)) {
          setPreviousTranslations(prev => [...prev, data.translationInfo!.targetLanguage]);
        }
      }
      
      toast({
        title: "Translation Successful",
        description: `Translated to ${getLanguageName(selectedLanguage)}`,
      });
      
      onTranslationComplete(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Translation Failed",
        description: error.message || "An error occurred during translation.",
        variant: "destructive",
      });
    },
  });

  // Handle translate button click
  const handleTranslate = (language: string) => {
    if (language === "en") {
      toast({
        title: "Already in English",
        description: "The content is already in English.",
      });
      return;
    }
    
    setSelectedLanguage(language);
    translateMutation.mutate(language);
  };

  // Get language name based on code
  const getLanguageName = (code: string): string => {
    if (!languages) return code;
    const language = languages.find((lang: any) => lang.code === code);
    return language ? language.name : code;
  };

  // Determine if button should be disabled
  const isButtonDisabled = 
    disabled || 
    translateMutation.isPending || 
    isLoadingLanguages ||
    isCheckingStatus ||
    !translationStatus?.available;

  const isTranslationAvailable = translationStatus?.available;
  const isLoading = isLoadingLanguages || isCheckingStatus || translateMutation.isPending;

  // Get primary languages for the quick access dropdown
  const primaryLanguages = languages ? 
    // Prioritize Nigerian languages
    languages.filter((lang: any) => 
      ['ha', 'yo', 'ig', 'pcm'].includes(lang.code)
    ) : [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={compact ? "outline" : "default"}
          size={compact ? "sm" : "default"}
          disabled={isButtonDisabled}
          className="flex items-center gap-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              {!compact && "Translating..."}
            </>
          ) : (
            <>
              <Languages className="w-4 h-4 mr-1" />
              {compact ? null : "Translate"}
              <ChevronDown className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isTranslationAvailable && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Translation service unavailable
          </div>
        )}
        
        {isTranslationAvailable && primaryLanguages.map((language: any) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleTranslate(language.code)}
            className="flex items-center justify-between"
            disabled={translateMutation.isPending}
          >
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              {language.name}
            </div>
            {previousTranslations.includes(language.code) && (
              <Check className="h-4 w-4 ml-2 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
        
        {isTranslationAvailable && languages && languages.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs text-muted-foreground">Other languages</div>
            {languages
              .filter((lang: any) => !primaryLanguages.some((primary: any) => primary.code === lang.code))
              .filter((lang: any) => lang.code !== 'en') // Filter out English
              .map((language: any) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => handleTranslate(language.code)}
                  className="flex items-center justify-between"
                  disabled={translateMutation.isPending}
                >
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    {language.name}
                  </div>
                  {previousTranslations.includes(language.code) && (
                    <Check className="h-4 w-4 ml-2 text-green-500" />
                  )}
                </DropdownMenuItem>
              ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}