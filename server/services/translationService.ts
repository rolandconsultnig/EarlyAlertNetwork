import OpenAI from 'openai';
import axios from 'axios';
// No need to import dotenv here since it's already configured in the application

// Create OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Replace with DeepSeek configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// List of supported languages with their codes
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ha', name: 'Hausa' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
  { code: 'pcm', name: 'Nigerian Pidgin' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
];

/**
 * Translates text to the specified language using OpenAI API
 * @param text The text to translate
 * @param targetLanguage The language code to translate to
 * @returns Translated text
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    if (!text || text.trim() === '') {
      return '';
    }

    // Language name based on code
    const language = supportedLanguages.find(lang => lang.code === targetLanguage)?.name || targetLanguage;

    // Use DeepSeek for translation
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text to ${language}. Only return the translated text, no explanations or additional text.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
}

/**
 * Detects the language of a given text
 * @param text Text to analyze
 * @returns The detected language code
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    if (!text || text.trim() === '') {
      return 'en'; // Default to English for empty text
    }

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a language detection expert. Analyze the provided text and determine which language it is written in.
            Return only the ISO language code such as 'en', 'ha', 'yo', 'ig', 'pcm', 'fr', 'ar', or 'pt'.
            For Nigerian Pidgin use 'pcm'. If unsure or the language is not in this list, return 'en'.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content || '{"languageCode": "en"}');
    return result.languageCode || 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English on error
  }
}