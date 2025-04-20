import { Incident } from '@shared/schema';

// Translation info type definition
export interface TranslationInfo {
  isTranslated: boolean;
  originalLanguage: string;
  targetLanguage: string;
  translatedAt: string;
}

// Extended Incident type with translation info
export interface TranslatedIncident extends Omit<Incident, 'reportedAt'> {
  translationInfo?: TranslationInfo;
  reportedAt: Date | string;
}