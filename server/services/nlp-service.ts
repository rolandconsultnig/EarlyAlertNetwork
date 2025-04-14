/**
 * NLP Service
 * 
 * This service provides natural language processing capabilities including:
 * - Sentiment analysis
 * - Keyword extraction
 * - Text classification
 * - Text summarization
 * - Named entity recognition
 * 
 * It uses rule-based approaches and patterns to mimic AI-like text analysis
 * without requiring external API calls.
 */

type SentimentResult = {
  score: number;  // -1 (negative) to 1 (positive)
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
};

type ExtractedKeyword = {
  text: string;
  type: 'keyword' | 'entity' | 'phrase' | 'topic';
  relevance: number;
};

type ClassificationResult = {
  category: string;
  confidence: number;
};

type EntityResult = {
  text: string;
  type: 'person' | 'organization' | 'location' | 'event' | 'date' | 'other';
  relevance: number;
};

export class NLPService {
  // Dictionary of positive words for sentiment analysis
  private positiveWords = [
    'good', 'great', 'excellent', 'positive', 'success', 'peaceful', 'resolve', 
    'agreement', 'cooperate', 'progress', 'improve', 'benefit', 'support', 
    'advance', 'development', 'stability', 'peace', 'secure', 'prosperity', 'hope', 
    'reconciliation', 'dialogue', 'collaboration', 'solution', 'resolve'
  ];
  
  // Dictionary of negative words for sentiment analysis
  private negativeWords = [
    'bad', 'terrible', 'poor', 'negative', 'failure', 'conflict', 'violence', 
    'crisis', 'threat', 'attack', 'disaster', 'damage', 'destroy', 'kill', 'hate', 
    'tension', 'dispute', 'protest', 'insurgent', 'terrorist', 'war', 'fight', 
    'clash', 'hostility', 'casualty', 'victim', 'injury', 'death', 'danger'
  ];
  
  // Categories for text classification
  private categories = {
    'conflict': ['violence', 'attack', 'war', 'fight', 'clash', 'battle', 'insurgent', 'combat', 'militant'],
    'political': ['government', 'election', 'party', 'policy', 'president', 'minister', 'vote', 'campaign', 'democracy'],
    'humanitarian': ['aid', 'refugee', 'displacement', 'shelter', 'food', 'water', 'medicine', 'emergency', 'assistance'],
    'environmental': ['flood', 'drought', 'storm', 'climate', 'disaster', 'earthquake', 'landslide', 'pollution'],
    'health': ['disease', 'outbreak', 'infection', 'hospital', 'clinic', 'patient', 'treatment', 'epidemic', 'pandemic'],
    'economic': ['economy', 'trade', 'business', 'market', 'financial', 'economic', 'poverty', 'unemployment', 'inflation']
  };
  
  // Named entity recognition patterns
  private entityPatterns = {
    person: [
      /President\s([A-Z][a-z]+(\s[A-Z][a-z]+){1,2})/g,
      /Minister\s([A-Z][a-z]+(\s[A-Z][a-z]+){1,2})/g,
      /([A-Z][a-z]+)\s([A-Z][a-z]+)(?:\s(?:said|announced|confirmed|stated|declared))/g
    ],
    organization: [
      /([A-Z][A-Za-z]*\s)*(Commission|Authority|Ministry|Agency|Council|Committee|Assembly|Organization|Organisation|Government|Army|Force)/g,
      /(UN|WHO|NATO|ECOWAS|AU|IPCR|NEMA|EU|UNICEF|WFP|ICRC|MSF)/g
    ],
    location: [
      /(Northern|Southern|Eastern|Western|Central|North|South|East|West)\s([A-Z][a-z]+)/g,
      /(?:in|at|near|from)\s([A-Z][a-z]+(\s[A-Z][a-z]+){0,2})/g,
      /(Lagos|Abuja|Kano|Kaduna|Ibadan|Port Harcourt|Benin City|Maiduguri|Jos|Calabar|Warri)/g
    ],
    date: [
      /(?:on|since|before|after)\s(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{1,2})(?:st|nd|rd|th)?(?:,\s(\d{4}))?/g,
      /(?:on|since|before|after)\s(\d{1,2})(?:st|nd|rd|th)?\s(January|February|March|April|May|June|July|August|September|October|November|December)(?:,\s(\d{4}))?/g,
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g
    ]
  };
  
  /**
   * Analyze the sentiment of a text
   * @param text The text to analyze
   * @returns Sentiment analysis result
   */
  analyzeSentiment(text: string): SentimentResult {
    const textLower = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Count positive words
    for (const word of this.positiveWords) {
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        positiveCount += matches.length;
      }
    }
    
    // Count negative words
    for (const word of this.negativeWords) {
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        negativeCount += matches.length;
      }
    }
    
    // Calculate score between -1 and 1
    const total = positiveCount + negativeCount;
    let score = 0;
    let confidence = 0.5; // Default medium confidence
    
    if (total > 0) {
      score = (positiveCount - negativeCount) / total;
      confidence = Math.min(0.9, 0.5 + (total / 20) * 0.4); // More words = higher confidence, up to 0.9
    }
    
    // Determine label based on score
    let label: 'positive' | 'negative' | 'neutral';
    if (score > 0.1) {
      label = 'positive';
    } else if (score < -0.1) {
      label = 'negative';
    } else {
      label = 'neutral';
      confidence = Math.min(confidence, 0.7); // Lower confidence for neutral results
    }
    
    return { score, label, confidence };
  }
  
  /**
   * Extract keywords from text
   * @param text The text to analyze
   * @param maxResults Maximum number of keywords to return
   * @returns Array of extracted keywords with relevance scores
   */
  extractKeywords(text: string, maxResults: number = 10): ExtractedKeyword[] {
    const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const wordCounts: Record<string, number> = {};
    const keywordResults: ExtractedKeyword[] = [];
    
    // Count word occurrences
    for (const word of words) {
      // Skip common stopwords
      if (this.isStopword(word)) continue;
      
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
    
    // Find phrases (bigrams and trigrams)
    const phrases = this.findPhrases(text);
    
    // Extract named entities
    const entities = this.extractEntities(text);
    
    // Convert word counts to keywords
    for (const [word, count] of Object.entries(wordCounts)) {
      keywordResults.push({
        text: word,
        type: 'keyword',
        relevance: Math.min(1.0, count / 5) // Normalize relevance score
      });
    }
    
    // Add phrases
    for (const phrase of phrases) {
      keywordResults.push({
        text: phrase,
        type: 'phrase',
        relevance: 0.8 // Assign high relevance to multi-word phrases
      });
    }
    
    // Add entities
    for (const entity of entities) {
      keywordResults.push({
        text: entity.text,
        type: 'entity',
        relevance: entity.relevance
      });
    }
    
    // Sort by relevance and limit results
    return keywordResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  }
  
  /**
   * Classify text into predefined categories
   * @param text The text to classify
   * @param maxResults Maximum number of categories to return
   * @returns Array of classification results with confidence scores
   */
  classifyText(text: string, maxResults: number = 3): ClassificationResult[] {
    const textLower = text.toLowerCase();
    const results: ClassificationResult[] = [];
    
    // Calculate score for each category
    for (const [category, keywords] of Object.entries(this.categories)) {
      let matches = 0;
      let totalWeight = 0;
      
      for (const keyword of keywords) {
        const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
        const matchCount = (textLower.match(regex) || []).length;
        
        if (matchCount > 0) {
          matches += matchCount;
          totalWeight += matchCount;
        }
      }
      
      if (matches > 0) {
        // Calculate confidence score based on matches and text length
        const confidence = Math.min(0.95, (totalWeight / (text.length / 50)) * 0.5);
        
        results.push({
          category,
          confidence
        });
      }
    }
    
    // Sort by confidence and limit results
    return results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxResults);
  }
  
  /**
   * Generate a summary of the input text
   * @param text The text to summarize
   * @param maxLength Maximum length of the summary in characters
   * @returns Summarized text
   */
  summarizeText(text: string, maxLength: number = 200): string {
    // Simple extractive summarization - extract key sentences
    
    // Split text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentences.length <= 3) {
      return text; // Text is already short enough
    }
    
    // Score sentences based on position and keywords
    const sentenceScores: {sentence: string, score: number}[] = [];
    const keywords = this.extractKeywords(text, 20);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      let score = 0;
      
      // Position scoring - first and last sentences are important
      if (i === 0 || i === sentences.length - 1) {
        score += 0.3;
      }
      
      // Keyword scoring
      for (const keyword of keywords) {
        const regex = new RegExp('\\b' + keyword.text + '\\b', 'gi');
        if (sentence.match(regex)) {
          score += 0.1 * keyword.relevance;
        }
      }
      
      sentenceScores.push({ sentence, score });
    }
    
    // Sort sentences by score
    sentenceScores.sort((a, b) => b.score - a.score);
    
    // Take top sentences until we reach max length
    let summary = '';
    let currentLength = 0;
    
    // Get top 5 sentences by score
    const topScoredSentences = sentenceScores.slice(0, 5);
    
    // Create array of indices for sorting
    const orderedSentences: {index: number, sentence: string}[] = [];
    
    // Find the original position of each top sentence
    for (let i = 0; i < topScoredSentences.length; i++) {
      const scoredSentence = topScoredSentences[i];
      const sentenceText = scoredSentence.sentence;
      const sentenceIndex = sentences.indexOf(sentenceText);
      if (sentenceIndex !== -1) {
        orderedSentences.push({
          index: sentenceIndex,
          sentence: sentenceText
        });
      }
    }
    
    // Sort by original position
    orderedSentences.sort((a, b) => a.index - b.index);
    
    // Build summary with the sentences in original order
    for (const item of orderedSentences) {
      if (currentLength + item.sentence.length <= maxLength) {
        summary += item.sentence + ' ';
        currentLength += item.sentence.length + 1;
      } else {
        break;
      }
    }
    
    return summary.trim();
  }
  
  /**
   * Extract named entities from text
   * @param text The text to analyze
   * @returns Array of extracted entities
   */
  extractEntities(text: string): EntityResult[] {
    const entities: EntityResult[] = [];
    
    // Apply each entity pattern
    for (const [type, patterns] of Object.entries(this.entityPatterns)) {
      for (const pattern of patterns) {
        const matches = text.match(pattern) || [];
        
        for (const match of matches) {
          if (match.trim()) {
            entities.push({
              text: match.trim(),
              type: type as 'person' | 'organization' | 'location' | 'event' | 'date' | 'other',
              relevance: 0.8 // Default relevance
            });
          }
        }
      }
    }
    
    // Remove duplicates
    const uniqueEntities = entities.filter((entity, index, self) =>
      index === self.findIndex(e => e.text === entity.text)
    );
    
    return uniqueEntities;
  }
  
  /**
   * Find common phrases (bigrams and trigrams) in text
   * @param text The text to analyze
   * @returns Array of phrases
   */
  private findPhrases(text: string): string[] {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const phrases: string[] = [];
    
    // Find bigrams (two-word phrases)
    for (let i = 0; i < words.length - 1; i++) {
      if (this.isStopword(words[i]) || this.isStopword(words[i+1])) continue;
      
      const bigram = words[i] + ' ' + words[i+1];
      phrases.push(bigram);
    }
    
    // Find trigrams (three-word phrases)
    for (let i = 0; i < words.length - 2; i++) {
      if (this.isStopword(words[i]) || this.isStopword(words[i+2])) continue;
      
      const trigram = words[i] + ' ' + words[i+1] + ' ' + words[i+2];
      phrases.push(trigram);
    }
    
    return phrases;
  }
  
  /**
   * Check if a word is a common stopword
   * @param word The word to check
   * @returns True if the word is a stopword
   */
  private isStopword(word: string): boolean {
    const stopwords = [
      'the', 'and', 'to', 'of', 'a', 'in', 'is', 'that', 'it', 'for', 'was', 'on', 'are', 
      'with', 'as', 'be', 'this', 'by', 'have', 'an', 'at', 'but', 'not', 'were', 'from', 
      'had', 'has', 'they', 'which', 'or', 'we', 'their', 'been', 'who', 'would', 'will', 
      'more', 'no', 'if', 'out', 'so', 'up', 'what', 'when', 'can', 'all', 'about', 'just'
    ];
    return stopwords.includes(word);
  }
}

export const nlpService = new NLPService();