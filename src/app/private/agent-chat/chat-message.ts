export interface ChatMessage {
  /** Message role */
  role: 'system' | 'user' | 'assistant';
  /** Textual content of the message */
  content: string;
}
