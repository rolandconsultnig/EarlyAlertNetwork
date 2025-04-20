// Translation-related types

export interface TranslationInfo {
  sourceLanguage: string;
  targetLanguage: string;
  translatedAt: string; // ISO date string
  confidence?: number;
}

export interface TranslatedIncident {
  id: number;
  title: string;
  description: string;
  location: string;
  region?: string;
  translationInfo?: TranslationInfo;
  additionalDetails?: Record<string, any>;
}

export interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

export interface TranslationStatus {
  available: boolean;
  message: string;
  provider?: string;
}