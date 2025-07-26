import { ChatMessage } from './chat-message';

export interface AgentChat {
  id?: string;
  agent: string;
  updated_at: number;
  messages: ChatMessage[];
}
