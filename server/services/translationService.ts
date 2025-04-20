import OpenAI from 'openai';
// No need to import dotenv here since it's already configured in the application

// Create OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Use OpenAI for translation
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${language}. 
          Preserve paragraph breaks, formatting, and maintain the same tone as the original text. 
          Return only the translated text without explanations or notes.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content?.trim() || text;
  } catch (error: any) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed: ${error.message || 'Unknown error'}`);
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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
    });

    const result = JSON.parse(response.choices[0].message.content || '{"languageCode": "en"}');
    return result.languageCode || 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English on error
  }
}