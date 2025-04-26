/**
 * Utility functions for speech recognition and synthesis
 */

/**
 * Speak a message using the browser's speech synthesis API
 * @param text The text to be spoken
 * @param options Optional configuration for the speech synthesis
 */
export function speak(
  text: string, 
  options: {
    rate?: number;    // Speech rate (0.1 to 10)
    pitch?: number;   // Speech pitch (0 to 2)
    volume?: number;  // Speech volume (0 to 1)
    voice?: SpeechSynthesisVoice | null; // Voice to use
    onEnd?: () => void; // Callback when speech ends
  } = {}
): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser');
    return;
  }
  
  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set options with defaults
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;
  
  // Set voice if provided
  if (options.voice) {
    utterance.voice = options.voice;
  }
  
  // Add end event listener if callback provided
  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }
  
  // Speak the utterance
  window.speechSynthesis.speak(utterance);
}

/**
 * Get all available voices for speech synthesis
 * @returns Array of available voices
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported in this browser');
      resolve([]);
      return;
    }
    
    // If voices are already loaded
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // Otherwise wait for voices to be loaded
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });
}

/**
 * Cancel any ongoing speech synthesis
 */
export function cancelSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks if browser supports speech recognition
 * @returns True if speech recognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  const windowWithSpeech = window as any;
  return !!(
    windowWithSpeech.SpeechRecognition || 
    windowWithSpeech.webkitSpeechRecognition ||
    windowWithSpeech.mozSpeechRecognition ||
    windowWithSpeech.msSpeechRecognition
  );
}

/**
 * Get appropriate speech recognition constructor based on browser
 * @returns Speech recognition constructor or null if not supported
 */
export function getSpeechRecognition(): any {
  const windowWithSpeech = window as any;
  return (
    windowWithSpeech.SpeechRecognition || 
    windowWithSpeech.webkitSpeechRecognition ||
    windowWithSpeech.mozSpeechRecognition ||
    windowWithSpeech.msSpeechRecognition ||
    null
  );
}