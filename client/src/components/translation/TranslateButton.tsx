import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Languages } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Define the translation info type
interface TranslationInfo {
  isTranslated: boolean;
  originalLanguage: string;
  targetLanguage: string;
  translatedAt: string;
}

// Import the Incident type
import { Incident } from '@shared/schema';

// Define the translated incident type
interface TranslatedIncident extends Omit<Incident, 'reportedAt'> {
  translationInfo?: TranslationInfo;
  reportedAt: Date | string;
}

// PropTypes for component
interface TranslateButtonProps {
  incidentId: number;
  targetLanguage: string;
  disabled?: boolean;
  onTranslationComplete: (translatedData: TranslatedIncident) => void;
}

export function TranslateButton({
  incidentId,
  targetLanguage,
  disabled = false,
  onTranslationComplete,
}: TranslateButtonProps) {
  const { toast } = useToast();

  // Translation mutation
  const translateMutation = useMutation({
    mutationFn: async () => {
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
      toast({
        title: "Translation Successful",
        description: "The incident has been translated successfully.",
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
  const handleTranslate = () => {
    if (targetLanguage === "en") {
      toast({
        title: "Already in English",
        description: "The content is already in English.",
      });
      return;
    }

    translateMutation.mutate();
  };

  // Determine if button should be disabled
  const isButtonDisabled = 
    disabled || 
    translateMutation.isPending || 
    !targetLanguage ||
    targetLanguage === "";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTranslate}
      disabled={isButtonDisabled}
      className="flex items-center gap-1"
    >
      {translateMutation.isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          Translating...
        </>
      ) : (
        <>
          <Languages className="w-4 h-4 mr-1" />
          Translate
        </>
      )}
    </Button>
  );
}