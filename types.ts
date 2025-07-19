
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Drink' | 'Side';
  tasteProfiles: string[]; // e.g., ["Spicy", "Sweet", "Savory"]
  price: string;
  pieces?: number; // Optional: number of pieces if the item is composed of multiple units
  reason?: string; // Optional reason for suggestion, used in chat
}

export interface OrderItem extends MenuItem {
  quantity: number;
  customizationNotes?: string; // New field for customization
}

export interface TasteProfileOption {
  value: string;
  label: string;
  emoji: string;
}

export interface SuggestedItem {
  id: string;
  reason: string;
}

// For the simplified menu structure sent to Gemini
export interface MenuItemForPrompt {
  id: string;
  name: string;
  category: string;
  tasteProfiles: string[];
  description?: string; // Optional, can be brief
  pieces?: number; // Optional: number of pieces for prompt context
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system'; // Added 'system' sender
  text: string;
  suggestions?: MenuItem[]; // Store full MenuItem objects if suggestion
  timestamp: Date;
  isError?: boolean;
  quickSuggestions?: string[]; // For interactive suggestion buttons
  commandHintText?: string; // For displaying a separate hint about commands
  orderItems?: OrderItem[]; // For displaying current order
  orderTotal?: string;      // For displaying order total
  isOrderConfirmationPrompt?: boolean; // For checkout confirmation message
}

declare global {
  // Speech Recognition API Types
  // Based on MDN and common usage for Web Speech API

  interface SpeechRecognitionEventMap {
    "audiostart": Event;
    "audioend": Event;
    "end": Event;
    "error": SpeechRecognitionErrorEvent;
    "nomatch": SpeechRecognitionEvent;
    "result": SpeechRecognitionEvent;
    "soundstart": Event;
    "soundend": Event;
    "speechstart": Event;
    "speechend": Event;
    "start": Event;
  }

  interface SpeechRecognition extends EventTarget {
    grammars: SpeechGrammarList;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    serviceURI: string;

    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

    abort(): void;
    start(): void;
    stop(): void;

    addEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };

  var webkitSpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };

  interface SpeechGrammar {
    src: string;
    weight: number;
  }
  var SpeechGrammar: {
    prototype: SpeechGrammar;
    new(): SpeechGrammar;
  };

  interface SpeechGrammarList {
    readonly length: number;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
    addFromString(string: string, weight?: number): void;
    addFromURI(src: string, weight?: number): void;
  }
  var SpeechGrammarList: {
    prototype: SpeechGrammarList;
    new(): SpeechGrammarList;
  };

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
    readonly interpretation: any; 
    readonly emma: Document | null; 
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  type SpeechRecognitionErrorCode =
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported";

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }

  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof webkitSpeechRecognition;
    SpeechGrammarList?: typeof SpeechGrammarList;
    webkitSpeechGrammarList?: typeof SpeechGrammarList;
  }
}